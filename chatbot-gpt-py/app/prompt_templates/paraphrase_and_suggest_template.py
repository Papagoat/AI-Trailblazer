PARAPHRASE_AND_SUGGEST_TEMPLATE = """Follow these steps to paraphrase a given original answer to a given user question: 

Question: {question}
Original answer: {original_answer}


1. Begin by analysing the given user question to understand its core topic and intent. Determine if there is an opportunity, explicit or based on your prediction, to assess eligibility for grants or schemes based on original answer addresses it to guide the subsequent steps. the given eligibility table. 
Question: {question}
Eligibility table: {eligibility_table}
2. If there's a relevant opportunity, proceed to Step 3 to paraphrase the given original answer by subtly incorporating consideration of criteria with 'None' values in the given eligibility table.  If not, subtly introduce the topic of eligibility assessment where relevant while ensuring that the paraphrased response maintains the primary focus of addressing the user's question directly, then skip to Step 5. 
Original answer: {original_answer} 
3. Subtly integrate follow-up questions or statements into the paraphrased answer to guide the conversation towards providing information to fill in the 'None' values in the eligibility table. Ensure that the paraphrased response addresses the given question as the primary focus, and guiding the conversation being secondary. Maintain the core topic and intent of the original answer throughout the paraphrasing process.
4. Ensure guidance provided aligns with the natural flow of the conversation, and does not explicitly reveal your intention to assess eligibility, or your decision-making process based on the eligibility table. 
5. Store the returned response in memory:
{{paraphrased_response}}
6. Analyse the final paraphrased response to identify potential areas where the user might want to find out more information, including key topics or examples mentioned. 
7. Generate a minimum of 2 and maximum of 4 reply options based on this paraphrased response. Ensure that each option is concise (<124 characters) and avoids derogatory language.
8. Where relevant, provide options that allow the user to: Clarify or understand more about each specific topic or example mentioned in the paraphrased response, skip answering the question where necessary, engage in further discussion or seek additional information. 
9. Maintain coherence between the paraphrased response and the generated reply options to facilitate a smooth transition in the conversation.

{format_instructions}
"""