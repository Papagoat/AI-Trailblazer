from enum import Enum


class CriteriaEnum(str, Enum):
    """The types of the Criteria."""
    LOW_INCOME = "Is the user or the person in question considered low income?"
    LOW_FINANCIAL_AND_OR_LEGAL_LITERACY = "Does the person in question demonstrate a limited understanding of fundamental financial and/or legal concepts?"
    FAMILY_OF_PWD = "Is the person in question a family of a person with disability?"
    ACCIDENT = "Was the user or person in question recently in an accident?"
