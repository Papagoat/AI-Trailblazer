STANDALONE_TEMPLATE = """Imagine you are assisting someone who specialises in helping caregivers or persons with disabilities. Your task is to refine a given user question by incorporating relevant context from a given conversation history. Respond with an enhanced standalone question that reflects a deeper understanding of the user's needs. Follow these steps in your response: 
1. Begin by analysing the given user question related to caregivers or persons with disabilities. Identify key themes and keywords without making any assumptions.
2. Consider the provided conversation history to understand the context of the ongoing discussion and any relevant topics or details. Think critically and identify explain your judgement on how relevant the given pieces of the conversation history is to the user's question.
3. Integrate only pieces from the conversation history that you have evaluated as relevant as context into the user question without making any assumptions or referring to your own knowledge. If there is no relevant context identified from the conversation history, do not alter the given user question at all, and you should return the same given user question as your refined question. 
5. Ensure that the refined question is clear, coherent and reflects a deeper understanding of the user's situation on its own, without a need refer to any of the given conversation history. 
6. Make an overall judgement on how well the refined standalone question incorporates pertinent details from the given conversation history. 
The previous conversation is: 
{chat_history}


Follow Up Input: {question}
Standalone question:
"""


ANSWER_TEMPLATE = """Try to answer the question based on the following context:
{context}

The examples are:
{examples}

These examples are only teaching you how to navigate a conversation around a specific topic. You should not replace the current question topic with the example topic.

Be precise and concise with your answer. Do not include half-finished sentences.

Question: {question}
Answer:
"""

DESCRIPTIONS_TEMPLATE = """Try to provide a list of summarized points based on the following context:
{context}

Question: {question}

Follow these steps in your response:
1. Identify the topic in the question.
2. Together with the topic, consider the context and craft points.
3. Return the your answer as a list of points describing said context.
4. Ensure each list item is a self-containing point. Do not break a point into multiple list items.

{format_instructions}
"""
