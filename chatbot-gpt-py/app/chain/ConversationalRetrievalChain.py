from operator import itemgetter
from threading import Lock

from langchain.llms import VertexAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.messages import get_buffer_string
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough, RunnableParallel

from app.retriever.retriever import getRetriever
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
    This class ...
    """

    def __init__(self) -> None:
        # pylint: disable-next=not-callable
        self.model = VertexAI(temperature=0)
        self.memory = ConversationBufferMemory(
            return_messages=True, output_key="answer", input_key="question"
        )
        self.retriever = getRetriever()
        self.chain = self.get_chain()

    def get_chain(self):
        """This method instantiates the chain"""
        loaded_memory = RunnablePassthrough.assign(
            chat_history=RunnableLambda(
                self.memory.load_memory_variables) | itemgetter("history"),
        )

        standalone_template = """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
        
        Please answer in the same language as the incoming question.
        
        Chat History:
        {chat_history}
        Follow Up Input: {question}
        Standalone question:"""
        CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(
            standalone_template)

        # RAG answer synthesis prompt
        answer_template = """Try to answer the question based on the following context:
    
        {context}

        If the question is irrelevant to the context, answer it with your own knowledge base.

        Question: {question}
        """
        ANSWER_PROMPT = ChatPromptTemplate.from_template(answer_template)

        # get standalone question
        standalone_question = {
            "standalone_question": {
                "question": lambda x: x["question"],
                "chat_history": lambda x: get_buffer_string(x["chat_history"]),
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
        self.memory.save_context({"question": question}, {"answer": answer})
