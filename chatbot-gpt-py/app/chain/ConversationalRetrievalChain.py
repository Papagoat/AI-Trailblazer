from operator import itemgetter
from threading import Lock

from langchain.llms import VertexAI
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel

from app.retriever.retriever import get_vector_search_retriever, get_memory_retriever
from app.helpers import combine_documents


class SingletonMeta(type):
    """
    This is a thread-safe implementation of Singleton.
    """

    _instances = {}

    _lock: Lock = Lock()
    """
    We now have a lock object that will be used to synchronize threads during
    first access to the Singleton.
    """

    def __call__(cls, *args, **kwargs):
        """
        Possible changes to the value of the `__init__` argument do not affect
        the returned instance.
        """
        # Now, imagine that the program has just been launched. Since there's no
        # Singleton instance yet, multiple threads can simultaneously pass the
        # previous conditional and reach this point almost at the same time. The
        # first of them will acquire lock and will proceed further, while the
        # rest will wait here.
        with cls._lock:
            # The first thread to acquire the lock, reaches this conditional,
            # goes inside and creates the Singleton instance. Once it leaves the
            # lock block, a thread that might have been waiting for the lock
            # release may then enter this section. But since the Singleton field
            # is already initialized, the thread won't create a new object.
            if cls not in cls._instances:
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance
        return cls._instances[cls]


class ConversationalRetrievalChain(metaclass=SingletonMeta):
    """
    This class creates a chain that attempts to FIRST answer user question on the dataset before falling back on its own knowledge.
    
    final_chain = loaded_memory | standalone_question | retrieved_documents | answer | updateMemory    
    """

    def __init__(self) -> None:
        # pylint: disable-next=not-callable
        self.model = VertexAI(temperature=0, verbose=True)
        self.memory = get_memory_retriever()
        self.retriever = get_vector_search_retriever()
        self.chain = self.get_chain()

    def get_chain(self):
        """This method instantiates the chain"""
        loaded_memory = RunnableParallel({
            "question": lambda x: x["question"],
            "chat_history": lambda x: self.memory.load_memory_variables({ "human": x["question"] })["history"]
        })

        standalone_template = """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
        
        Please answer in the same language as the incoming question.

        Relevant pieces of previous conversation:
        {chat_history}

        (You do not need to use these pieces of information if not relevant)

        Follow Up Input: {question}
        Standalone question:"""
        CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(
            standalone_template)

        # RAG answer synthesis prompt
        answer_template = """Try to answer the question based on the following context:
        {context}

        Question: {question}

        If the context is not relevant to the question, answer based on your own knowledge.

        Do not say that you cannot answer this question. Instead, either:
        1. Create a standalone question to ask the human on what he means.
        2. Inform the human to rephrase his question to be more specific.
        """
        ANSWER_PROMPT = ChatPromptTemplate.from_template(answer_template)

        # get standalone question
        standalone_question = {
            "standalone_question": {
                "question": lambda x: x["question"],
                "chat_history": lambda x: x["chat_history"],
            }
            | CONDENSE_QUESTION_PROMPT
            | self.model
            | StrOutputParser(),
        }

        # Now we retrieve the documents
        retrieved_documents = {
            "docs": itemgetter("standalone_question") | self.retriever,
            "question": lambda x: x["standalone_question"],
        }

        # Now we construct the inputs for the final prompt
        final_inputs = {
            "context": lambda x: combine_documents(x["docs"]),
            "question": itemgetter("question"),
        }

        # And finally, we do the part that returns the answers
        answer = {
            "question": lambda x: x["question"],
            # pylint: disable-next=not-callable
            "answer": final_inputs | ANSWER_PROMPT | self.model,
            "docs": itemgetter("docs"),
        }

        updateMemory = RunnableParallel({
            "answer": lambda x: x["answer"],
            "_": lambda x: self.save_to_memory(x["question"], x["answer"])
        })


        final_chain = loaded_memory | standalone_question | retrieved_documents | answer | updateMemory

        return final_chain

    def save_to_memory(self, question: str, answer: str):
        """This method saves chat history to memory"""
        self.memory.save_context({"human": question}, {"ai": answer})
