from enum import Enum


class CriteriaEnum(str, Enum):
    """The types of the Criteria."""
    CITIZENSHIP = "Is the recipient Singaporean or a Singapore Permanent Resident?"
    ADL = "Does the care recipient need help with 3 or more of 6 Activities of Daily Living, which are bathing, feeding, dressing, moving from bed to chair or chair to bed, using the toilet, walking or moving around?"
    RESIDENTIAL_STATUS = "Is the recipient currently in a residential long-term institution like a nursing home?"
    RESIDENTIAL_ADDRESS = "Is the address listed on the care recipient's NRIC a private property?"
    AVG_HOUSEHOLD_INCOME = "Is the average income per person in the household $2,800 and less?"
    PROPERTY_OWNERSHIP = "Does the user or their household member own more than 1 property?"