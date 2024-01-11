PARAPHRASE_TEMPLATE = """Given the eligibility table below, craft a paraphrased response from the original answer.

The response should guide the conversation by considering the criteria with 'None' values, but the response should not leak
information about the None values. It is only to help with your thought process.

Decide whether to pose questions to the user to assess their eligibility. If there's no need for further inquiry, provide the original answer directly.

Eligibility Table:
{eligibility_table}

Original Answer:
{original_answer}

Paraphrased Answer:
"""