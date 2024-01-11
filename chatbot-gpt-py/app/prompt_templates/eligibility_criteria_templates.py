CRITERIA_TEMPLATE = """
Respond Y or N based on how well the following response follows the specified rubric. Grade only based on the rubric and expected response:

Grading Rubric: {criteria}

DATA:
---------
Question: {question}
---------
Write out your explanation for each criterion detailing your thought process, then respond with a JSON output:
{{
  "criteria": {{criteria}}
  "reasoning": "detailed explanation",
  "value": "Y/N"
}}
"""

CLASSIFIER_TEMPLATE = """
Given the user question below, classify it as either being about one of the criteria's in this list
{criteria_names}

Do not respond with more than one word. 

<question>
{question}
</question>

Classification:
"""
