from operator import itemgetter
from threading import Lock

from langchain.llms import VertexAI
from langchain.prompts import ChatPromptTemplate, PromptTemplate, FewShotChatMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

from app.retriever.retriever import get_vector_search_retriever, get_memory_retriever
from app.helpers import combine_documents
from app.prompt_templates.main_templates import STANDALONE_TEMPLATE, ANSWER_TEMPLATE
from app.prompt_templates.system_template import SYSTEM_TEMPLATE
from app.prompt_templates.few_shot_templates import examples
from app.utilities.debug import debug_fn


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

        CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(
            STANDALONE_TEMPLATE)

        # RAG answer synthesis prompt
        ANSWER_PROMPT = ChatPromptTemplate.from_messages([
                ("system", SYSTEM_TEMPLATE),
                ("system", ANSWER_TEMPLATE)
            ])
        
        EXAMPLE_PROMPT = ChatPromptTemplate.from_messages([
            ("human", "{human}"), ("ai", "{ai}")
        ])
        # Test Few Shot integration into standalone question
        FEW_SHOT_PROMPT = FewShotChatMessagePromptTemplate(
            examples=examples,
            example_prompt=EXAMPLE_PROMPT,
        ).format()

        # get standalone question
        standalone_question = {
            "standalone_question": RunnablePassthrough.assign(
                examples=lambda _: FEW_SHOT_PROMPT
            )
            | debug_fn
            | CONDENSE_QUESTION_PROMPT
            | debug_fn
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
            "answer": final_inputs | ANSWER_PROMPT | debug_fn | self.model,
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
