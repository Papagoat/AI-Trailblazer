from operator import itemgetter
from typing import Dict

from langchain_community.llms import VertexAI
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableBranch, RunnableSequence
from langchain.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field

from app.enums.criteria_enums import CriteriaEnum
from app.prompt_templates.eligibility_criteria_templates import CRITERIA_TEMPLATE, CLASSIFIER_TEMPLATE

class Answer(BaseModel):
    """
    Typings for Evaluator output
    """
    criteria: str = Field(description="criteria")
    reasoning: str = Field(description="detailed explanation")
    value: str = Field(description="Y/N")

class EvaluationChain():
    """This class evaluates the user's input"""

    def __init__(self, eligibility_dict: Dict[str, bool]) -> None:
        """This method instantiates an instance of EvaluationChain"""
        # pylint: disable-next=not-callable
        self.model = VertexAI(
            model="chat-bison-32k", temperature=0, verbose=True, max_tokens=32768)
        self.eligibility_dict = eligibility_dict
        self.chain = self.get_chain()

    def get_chain(self) -> RunnableSequence:
        """
        This method returns the evaluation chain.

        ..evaluation_chain
        classifier_chain | RunnableBranch

        The classifier_chain classifies the input as one of the types in CriteriaEnum
        and passes it to RunnableBranch. The matched runnable is then invoked based
        on the value from the classifier_chain.

        ..RunnableBranch consists of
            1. Default Runnable that returns None if no branches are matched
            2. Custom runnables loaded with each criteria in CriteriaEnum
        """
        evaluators = self.get_evaluators()
        classifier_chain = self.get_classifier_chain()

        def update_and_invoke(evaluator: RunnableSequence, question: str, criteria: str) -> Dict[str, str]:
            """
            This helper function does:
            1. Invokes evaluation chain
            2. Updates eligibility criteria dictionary based on the outcome in 1
            """
            res = evaluator.invoke(question)

            if res["value"] == "Y" and self.eligibility_dict[criteria] in [False, None]:
                self.eligibility_dict[criteria] = True

            return res

        branch = RunnableBranch(
            *[
                (
                    lambda x, k=k: k in x["criteria"].strip() and self.eligibility_dict[k] in [
                        False, None],
                    lambda x, k=k, v=v: update_and_invoke(v, x["question"], k)
                ) for k, v in evaluators.items()
            ],
            lambda x: None
        )
        eval_chain = {"criteria": classifier_chain,
                      "question": lambda x: x["question"]} | branch
        return eval_chain

    def get_classifier_chain(self) -> RunnableSequence:
        """
        This method returns a classifier chain that classifies the question as one
        of the criteria defined in CriteriaEnum.

        If no criteria is matched, None is returned.
        """
        criteria_names = [criteria.name for criteria in CriteriaEnum]
        CLASSIFIER_PROMPT = PromptTemplate.from_template(CLASSIFIER_TEMPLATE)
        classifier_chain = (
            {
                "question": RunnablePassthrough() | itemgetter("question"),
                "criteria_names": lambda x: criteria_names
            }
            | CLASSIFIER_PROMPT
            # pylint: disable-next=not-callable
            | VertexAI(verbose=True)
            | StrOutputParser()
        )
        return classifier_chain

    def get_evaluators(self) -> Dict[str, RunnableSequence]:
        """
        This method returns a dictionary of CRITERIA_NAME : CRITERIA_CHAIN
        """
        CRITERIA_PROMPT = PromptTemplate.from_template(CRITERIA_TEMPLATE)
        parser = JsonOutputParser(pydantic_object=Answer)
        return {
            criteria.name: (
                {
                    "question": RunnablePassthrough(),
                    "criteria": lambda x, c=criteria: {c.name: c.value}
                }
                | CRITERIA_PROMPT
                # pylint: disable-next=not-callable
                | VertexAI(verbose=True)
                | parser
            ) for criteria in CriteriaEnum
        }
