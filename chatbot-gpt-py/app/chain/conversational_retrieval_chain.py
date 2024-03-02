from typing import List
from operator import itemgetter

from langchain.chat_models.vertexai import ChatVertexAI
from langchain.prompts import ChatPromptTemplate, PromptTemplate, FewShotChatMessagePromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableSequence


from app.retriever.retriever import get_vector_search_retriever, get_memory_retriever
from app.retriever.example_selector import get_fewshot_example_selector
from app.helpers import combine_documents, handle_malformed_json
from app.prompt_templates.main_templates import STANDALONE_TEMPLATE, ANSWER_TEMPLATE, INFO_TEMPLATE
from app.prompt_templates.system_template import SYSTEM_TEMPLATE
from app.prompt_templates.fewshot_templates import FEWSHOT_ANSWER_EXAMPLES


class StandaloneQuestionOutput(BaseModel):
    """Typings for standalone question output item"""
    topic: str = Field(
        description="This the main topic of the refined standalone question.")
    standalone_question: str = Field(
        description="This is the refined standalone question.")

class InfoItem(BaseModel):
    """Typings for description item"""
    content: str = Field(
        description="This is the content string for each description item.")
    title: str = Field(
        description="This is the title associated with each description item. It summarizes the content string.")


class InfoOutput(BaseModel):
    """Typings for descriptions chain output"""
    details: List[InfoItem] = Field(
        description="This is the list of InfoItems.")
    explanation: str = Field(
        description="This is the explanation of your thought process in crafting the entire output. Be as thorough and detailed as you can be.")


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
            model_name="chat-bison-32k", temperature=0, max_output_tokens=8192)
        self.memory = get_memory_retriever()
        self.retriever = get_vector_search_retriever()
        self.chain = self.get_chain()

    def get_chain(self) -> RunnableSequence:
        """This method instantiates the chain"""
        loaded_memory = RunnableParallel({
            "question": lambda x: x["question"],
            "chat_history": lambda x: self.memory.load_memory_variables({"human": x["question"]})["history"]
        })

        retrieved_documents = RunnablePassthrough.assign(
            docs=itemgetter("standalone_question") | self.retriever
        )

        # get chains
        standalone_question_chain = self.get_standalone_question_chain()
        answer_chain = self.get_answer_chain()
        info_chain = self.get_info_chain()
        self_correcting_info_chain = info_chain.with_fallbacks([self.get_info_chain()])

        update_memory = RunnablePassthrough.assign(
            _=lambda x: self.save_to_memory(x["question"], x["answer"]),
        )

        final_chain = (
            loaded_memory
            | standalone_question_chain
            | retrieved_documents
            | RunnableParallel({
                "question": lambda x: x["standalone_question"],
                "topic": lambda x: x["topic"],
                "answer": answer_chain,
                "information": self_correcting_info_chain
            })
            | update_memory
        )

        return final_chain

    def save_to_memory(self, question: str, answer: str) -> None:
        """This method saves chat history to memory"""
        self.memory.save_context({"human": question}, {"ai": answer})

    def get_standalone_question_chain(self) -> RunnableSequence:
        """This method returns the standalone question chain"""
        standalone_question_parser = JsonOutputParser(
            pydantic_object=StandaloneQuestionOutput)
        CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(
            STANDALONE_TEMPLATE, partial_variables={"format_instructions": standalone_question_parser.get_format_instructions()})

        standalone_question_chain = (RunnablePassthrough()
                                     | CONDENSE_QUESTION_PROMPT
                                     | self.model
                                     | standalone_question_parser
                                     )

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
            "topic": itemgetter('topic'),
            "question": itemgetter("standalone_question"),
            "examples": lambda x: FEWSHOT_ANSWER_PROMPT.format(human=x["standalone_question"]),
        }

        # answer_chain = final_inputs | ANSWER_PROMPT | self.model | answer_parser | debug_fn
        answer_chain = final_inputs | ANSWER_PROMPT | self.model | StrOutputParser()

        return answer_chain

    def get_info_chain(self) -> RunnableSequence:
        """This method returns the information chain"""

        info_parser = JsonOutputParser(pydantic_object=InfoOutput)
        INFO_PROMPT = PromptTemplate.from_template(INFO_TEMPLATE, partial_variables={
            "format_instructions": info_parser.get_format_instructions()
        })

        info_chain = (
            {
                "context": lambda x: combine_documents(x["docs"]),
                "topic": itemgetter("topic"),
                "question": itemgetter("standalone_question")
            }
            | INFO_PROMPT
            | ChatVertexAI(model_name="chat-bison-32k", temperature=0, max_output_tokens=8192)
            | handle_malformed_json
            | info_parser
        )

        return info_chain
