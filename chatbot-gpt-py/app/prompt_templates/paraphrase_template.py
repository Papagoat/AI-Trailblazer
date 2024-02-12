PARAPHRASE_TEMPLATE = """Given the eligibility table below, first craft a paraphrased response from the original answer.

The response should guide the conversation by considering the criteria with 'None' values, but the response should not leak
information about the None values. It is only to help with your thought process.

Decide whether to pose questions to the user to assess their eligibility. If there's no need for further inquiry, provide the original answer directly.

Eligibility Table:
{eligibility_table}

Original Answer:
{original_answer}

Store the paraphrased answer in memory:
{{paraphrased_answer}}

Using the paraphrased answer that you have come up with, curate a list of suggested responses that a human would make to this paraphrased answer.

Return a JSON object of both the paraphrased_answer as well as the suggested responses:
{{
  "answer": "{{paraphrased_answer}}",
  "suggested_responses": ["response 1", "response 2", "response 3"]
}}
"""