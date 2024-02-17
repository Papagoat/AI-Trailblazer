PARAPHRASE_AND_SUGGEST_TEMPLATE = """Your task is to paraphrase a given original response to guide the conversation to gather required details to populate the given eligibility table, without revealing the inner workings of the solution or mentioning the eligibility table. For criteria with 'None' values, suggest additional questions to gather the required details for eligibility determination. 

Eligibility Table:
{eligibility_table}

Original Answer:
{original_answer}

Follow these steps in your response:
1. Begin by analysing the original response and determining if it addresses or updates any of the eligibility table.
2. Identify any 'None' values in the eligibility table. If there are no 'None' values, there is no need to paraphrase. You can skip the next step and return the original response as-is.
3. Paraphrase the original response to gather details for these identified values without mentioning the eligibility table. Ensure that the paraphrased response maintains clarity and coherence. 
4. Store the returned response in memory:
{{paraphrased_answer}}
5. Analyse the paraphrased response to identify and make a judgement if it lists topics or examples that the user might want to find out more about. 
6. Generate a minimum of 2 and maximum of 4 reply options that the human would likely make in response to the paraphrased response. These reply options are suggestions to help the human along the conversation if they are unsure of how to respond to your paraphrased response. If your judgement from point 5 was positive, ensure that these reply options give users the choice to find out about each of the listed topics or examples.
7. Ensure each reply option is concise (< 124 characters) and avoid derogatory language. Whenever relevant, ensure that one option allows the human to clarify or understand more, while another option allows them to skip answering the question if necessary.

{format_instructions}

"""