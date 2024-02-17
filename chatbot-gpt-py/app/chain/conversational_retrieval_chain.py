from operator import itemgetter

from langchain.chat_models.vertexai import ChatVertexAI
from langchain.prompts import ChatPromptTemplate, PromptTemplate, FewShotChatMessagePromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser, CommaSeparatedListOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableSequence


from app.retriever.retriever import get_vector_search_retriever, get_memory_retriever
from app.retriever.example_selector import get_fewshot_example_selector
from app.helpers import combine_documents
from app.prompt_templates.main_templates import STANDALONE_TEMPLATE, ANSWER_TEMPLATE, DESCRIPTIONS_TEMPLATE
from app.prompt_templates.system_template import SYSTEM_TEMPLATE
from app.prompt_templates.fewshot_templates import FEWSHOT_ANSWER_EXAMPLES

class ConversationalRetrievalChain():
    """
    This class creates a chain that attempts to FIRST answer user question on the dataset before falling back on its own knowledge.

    final_chain = loaded_memory | standalone_question | retrieved_documents | answer / descriptions | updateMemory    
    """

    def __init__(self) -> None:
        """This method instantiates an instance of ConversationalRetrievalChain"""
        # https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models
        # pylint: disable-next=not-callable
        self.model = ChatVertexAI(
            model_name="chat-bison-32k", temperature=0, max_tokens=32768)
        self.memory = get_memory_retriever()
        self.retriever = get_vector_search_retriever()
        self.chain = self.get_chain()

    def get_chain(self) -> RunnableSequence:
        """This method instantiates the chain"""
        loaded_memory = RunnableParallel({
            "question": lambda x: x["question"],
            "chat_history": lambda x: self.memory.load_memory_variables({"human": x["question"]})["history"]
        })

        retrieved_documents = {
            "docs": itemgetter("standalone_question") | self.retriever,
            "question": lambda x: x["standalone_question"],
        }

        # get chains
        standalone_question_chain = self.get_standalone_question_chain()
        answer_chain = self.get_answer_chain()
        descriptions_chain = self.get_descriptions_chain()

        updateMemory = RunnableParallel({
            "answer": lambda x: x["answer"],
            "descriptions": lambda x: x["descriptions"],
            "_": lambda x: self.save_to_memory(x["question"], x["answer"]),
        })

        final_chain = (
            loaded_memory
            | standalone_question_chain
            | retrieved_documents
            | RunnableParallel({
                "question": lambda x: x["question"],
                "answer": answer_chain,
                "descriptions": descriptions_chain
            })
            | {
                "question": lambda x: x["question"],
                "answer": lambda x: x["answer"],
                "descriptions": lambda x: x["descriptions"]
            }
            | updateMemory
        )

        return final_chain

    def save_to_memory(self, question: str, answer: str) -> None:
        """This method saves chat history to memory"""
        self.memory.save_context({"human": question}, {"ai": answer})

    def get_standalone_question_chain(self) -> RunnableSequence:
        """This method returns the standalone question chain"""
        CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(
            STANDALONE_TEMPLATE)

        standalone_question_chain = {
            "standalone_question": RunnablePassthrough()
            | CONDENSE_QUESTION_PROMPT
            | self.model
            | StrOutputParser()
        }

        return standalone_question_chain

    def get_answer_chain(self) -> RunnableSequence:
        """This method returns the answer chain"""
        ANSWER_PROMPT = ChatPromptTemplate(messages=[
            SystemMessagePromptTemplate.from_template(SYSTEM_TEMPLATE),
            HumanMessagePromptTemplate.from_template(ANSWER_TEMPLATE)
        ])

        FEWSHOT_ANSWER_EXAMPLE_PROMPT = ChatPromptTemplate.from_messages([
            ("human", "{human}"), ("ai", "{ai}")
        ])

        FEWSHOT_ANSWER_PROMPT = FewShotChatMessagePromptTemplate(
            example_prompt=FEWSHOT_ANSWER_EXAMPLE_PROMPT,
            example_selector=get_fewshot_example_selector(
                FEWSHOT_ANSWER_EXAMPLES, k=2)
        )

        final_inputs = {
            "context": lambda x: combine_documents(x["docs"]),
            "question": itemgetter("question"),
            "examples": lambda x: FEWSHOT_ANSWER_PROMPT.format(human=x["question"]),
        }

        answer_chain = final_inputs | ANSWER_PROMPT | self.model | StrOutputParser()

        return answer_chain

    def get_descriptions_chain(self) -> RunnableSequence:
        """This method returns the descriptions chain"""

        descriptions_parser = CommaSeparatedListOutputParser()
        DESCRIPTIONS_PROMPT = PromptTemplate.from_template(DESCRIPTIONS_TEMPLATE, partial_variables={
            "format_instructions": descriptions_parser.get_format_instructions()
        })

        descriptions_chain = (
            {
                "context": lambda x: combine_documents(x["docs"]),
                "question": lambda x: x["question"]
            }
            | DESCRIPTIONS_PROMPT
            # | self.model
            | ChatVertexAI(model_name="chat-bison-32k", temperature=0, max_tokens=32768)
            | descriptions_parser
        )

        return descriptions_chain
