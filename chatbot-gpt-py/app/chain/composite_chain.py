from typing import List

from langchain.prompts import PromptTemplate
from langchain_google_vertexai import ChatVertexAI
from langchain_core.runnables import RunnableParallel, RunnableSequence
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

from app.chain.evaluation_chain import EvaluationChain
from app.enums.criteria_enums import CriteriaEnum
from app.chain.singleton import SingletonMeta
from app.prompt_templates.paraphrase_and_suggest_template import PARAPHRASE_AND_SUGGEST_TEMPLATE
from app.chain.conversational_retrieval_chain import ConversationalRetrievalChain

class ParaphraseAndSuggestOutput(BaseModel):
    """
    Typings for paraphrased chain output
    """
    answer: str = Field(description="answer")
    reply_options: List[str] = Field(
        description="list of suggested user responses")


class CompositeChain(metaclass=SingletonMeta):
    """
    This class combines both evaluation_chain and conversation_retrieval_chain 
    and paraphrases the answer if necessary.
    """

    def __init__(self) -> None:
        """This method instantiates an instance of CompositeChain"""
        self.eligibility_dict = {
            criteria.name: None
            for criteria in CriteriaEnum
        }
        self.eval_chain = EvaluationChain(self.eligibility_dict).chain
        self.cr_chain = ConversationalRetrievalChain().chain
        self.paraphrase_and_suggest_chain = self.get_paraphrase_and_suggest_chain()
        self.chain = self.get_chain()

    def get_chain(self) -> RunnableSequence:
        """
        This method returns the composite chain.

        ..composite_chain
          (evaluation_chain, conversational_chain) | paraphrase_chain

        The evaluation_chain and classifier_chain are ran in parallel. The outputs are passed
        to the paraphrase_chain which paraphrases the answer from classifier_chain based on
        the output from evaluation_chain.

        This is to guide the conversation along to determine the eligibility of the user for
        the grants.
        """
        chain = (
            RunnableParallel(
                {
                    "eval_chain": self.eval_chain,
                    "conversational_chain": self.cr_chain,
                })
            | {
                "response": self.paraphrase_and_suggest_chain,
                "information": lambda x: x["conversational_chain"]["information"] if "information" in x["conversational_chain"] else [],
                "topic": lambda x: x["conversational_chain"]["topic"]
            }
            | {
                "answer": lambda x: x['response']["answer"],
                "reply_options": lambda x: x['response']["reply_options"],
                "information": lambda x: x["information"],
                "topic": lambda x: x["topic"]
            }
        )

        return chain

    def get_paraphrase_and_suggest_chain(self) -> RunnableSequence:
        """This method returns a chain that paraphrases the answer, and provides suggested human responses"""
        parser = JsonOutputParser(pydantic_object=ParaphraseAndSuggestOutput)
        PARAPHRASE_AND_SUGGEST_PROMPT = PromptTemplate.from_template(PARAPHRASE_AND_SUGGEST_TEMPLATE, partial_variables={
            "format_instructions": parser.get_format_instructions()
        })

        paraphrase_and_suggest_chain = (
            {
                "original_answer": lambda x: x["conversational_chain"]["answer"],
                "eligibility_table": lambda x: self.eligibility_dict,
                "question": lambda x: x["conversational_chain"]["question"]
            }
            | PARAPHRASE_AND_SUGGEST_PROMPT
            | ChatVertexAI(model_name="chat-bison-32k", temperature=0, verbose=True, max_output_tokens=8192)
            | parser
        )

        return paraphrase_and_suggest_chain
