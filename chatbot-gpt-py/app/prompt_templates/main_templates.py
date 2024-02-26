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

INFO_TEMPLATE = """Try to provide a list of summarized points based on the following context:
{context}

Question: {question}

Follow these steps in your response:
1. Evaluate if the question requires a response with information about specific grants that are either explicitly mentioned in the question, or you identify as relevant examples. 
2. If no, skip to point 3. If yes, craft a response for each relevant grant you have identified by following these steps: 
2a. [Grants] Identify the name of the grant, and set it as a topic. 
2b. [Grants] For each of the following sub-topics, first set these sub-topics as the title. Then, consider the context and craft a description about it.
2c. [Grants] About the grant
2d. [Grants] Eligibility
2e. [Grants] Expected benefits
2f. [Grants] Application process

3. Evaluate if the question requires a response with information about a general topics. Craft a response for each relevant topic you have identified by following these steps: 
3a. Identify the main subject of each topic and set it as a topic. 
3b. Consider the context, and craft a description about it. Each description should be self-contained, and should not be mentioned in another description point. Where relevant, include examples in this description

Ensure each list item is a self-containing point. Do not break a point into multiple list items.

Ensure that only fully valid JSON should be returned.

{format_instructions}
"""