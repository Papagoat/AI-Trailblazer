from operator import itemgetter

from langchain.chat_models.vertexai import ChatVertexAI
from langchain.prompts import ChatPromptTemplate, PromptTemplate, FewShotChatMessagePromptTemplate, ChatMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableSequence

from app.retriever.retriever import get_vector_search_retriever, get_memory_retriever
from app.retriever.example_selector import get_fewshot_example_selector
from app.helpers import combine_documents
from app.prompt_templates.main_templates import STANDALONE_TEMPLATE, ANSWER_TEMPLATE
from app.prompt_templates.system_template import SYSTEM_TEMPLATE
from app.prompt_templates.fewshot_templates import FEWSHOT_ANSWER_EXAMPLES, FEWSHOT_STANDALONE_QUESTION_EXAMPLES


class ConversationalRetrievalChain():
    """
    This class creates a chain that attempts to FIRST answer user question on the dataset before falling back on its own knowledge.

    final_chain = loaded_memory | standalone_question | retrieved_documents | answer | updateMemory    
    """

    def __init__(self) -> None:
        """This method instantiates an instance of ConversationalRetrievalChain"""
        # https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models
        # pylint: disable-next=not-callable
        self.model = ChatVertexAI(
            model_name="chat-bison-32k", temperature=0, verbose=True, max_tokens=32768)
        self.memory = get_memory_retriever()
        self.retriever = get_vector_search_retriever()
        self.chain = self.get_chain()

    def get_chain(self) -> RunnableSequence:
        """This method instantiates the chain"""
        loaded_memory = RunnableParallel({
            "question": lambda x: x["question"],
            "chat_history": lambda x: self.memory.load_memory_variables({"human": x["question"]})["history"]
        })

        CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(
            STANDALONE_TEMPLATE)

        # RAG answer synthesis prompt
        ANSWER_PROMPT = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_TEMPLATE),
            ("human", ANSWER_TEMPLATE)
        ])

        CHAT_HISTORY_PROMPT = ChatMessagePromptTemplate.from_template(
            role="chat_history", template="{chat_history}")

        FEWSHOT_STANDALONE_QUESTION_EXAMPLE_PROMPT = ChatPromptTemplate.from_messages([
            ("human", "{human}"), CHAT_HISTORY_PROMPT, ("ai", "{ai}")
        ])

        FEWSHOT_STANDALONE_QUESTION_PROMPT = FewShotChatMessagePromptTemplate(
            example_prompt=FEWSHOT_STANDALONE_QUESTION_EXAMPLE_PROMPT,
            example_selector=get_fewshot_example_selector(
                FEWSHOT_STANDALONE_QUESTION_EXAMPLES, k=2)
        )

        FEWSHOT_ANSWER_EXAMPLE_PROMPT = ChatPromptTemplate.from_messages([
            ("human", "{human}"), ("ai", "{ai}")
        ])

        FEWSHOT_ANSWER_PROMPT = FewShotChatMessagePromptTemplate(
            example_prompt=FEWSHOT_ANSWER_EXAMPLE_PROMPT,
            example_selector=get_fewshot_example_selector(
                FEWSHOT_ANSWER_EXAMPLES, k=2)
        )

        # get standalone question
        standalone_question = {
            "standalone_question": RunnablePassthrough.assign(
                examples=lambda x: FEWSHOT_STANDALONE_QUESTION_PROMPT.format(
                    human=x["question"])
            )
            | CONDENSE_QUESTION_PROMPT
            | self.model
            | StrOutputParser()
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
            "examples": lambda x: FEWSHOT_ANSWER_PROMPT.format(human=x["question"])
        }

        # And finally, we do the part that returns the answers
        answer = {
            "question": lambda x: x["question"],
            # pylint: disable-next=not-callable
            "answer": final_inputs | ANSWER_PROMPT | self.model,
            "docs": itemgetter("docs"),
        }

        updateMemory = RunnableParallel({
            "answer": lambda x: x["answer"].content,
            "_": lambda x: self.save_to_memory(x["question"], x["answer"].content),
        })

        final_chain = loaded_memory | standalone_question | retrieved_documents | answer | updateMemory

        return final_chain

    def save_to_memory(self, question: str, answer: str) -> None:
        """This method saves chat history to memory"""
        self.memory.save_context({"human": question}, {"ai": answer})
