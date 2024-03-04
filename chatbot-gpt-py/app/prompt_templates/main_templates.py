STANDALONE_TEMPLATE = """Your task is to refine a given user question by weaving in relevant details from a provided chat history. Craft a rephrased question that can be understood independently, capturing the essence of the original query while incorporating contextual nuances. Follow the steps below while ensuring that each transition in thought maintains coherence and clarity, resulting in a refined, standalone question reflective of the conversation's progression: 

1. Begin by analysing the given user question thoroughly. This entails identifying the main topic, intent, and any specific details or nuances in the query. 
2. Analyse the provided chat history and make a judgement if there is relevant information that can enhance the understanding of the given user question. Look for context, background details or previous discussions related to the main topic at hand. If there is no relevant judgement, skip the remaining steps and return the given user question as your response without making any changes. 
{chat_history}
3. Extract and integrate the relevant context into the rephrased question without making any assumptions outside of the given chat history. Transition smoothly from the user's original inquiry to incorporating details from the chat history, ensuring coherence and logical progression. 
4. Preserve the essence of the user's original question throughout the rephrasing process. Although incorporating additional context, ensure that the core topic and intent remain unchanged. Ensure that the rephrased question does not repeat what was already discussed in the given chat_history.
5. Craft the rephrased question in a manner that is standalone, clear and comprehensible. Ensure that a third party can gain a deep understanding of the inquiry in the context of the user's situation without needed to refer back to previous interactions. 
6. Make a judgement if the rephrased question pertains to a specific grant or scheme, or if it covers a broader topic. 
7. If the rephrased question is about a specific grant or scheme, dynamically assign the name of the grant or scheme as the main topic. If the question is broader in scope, designate the topic you have identified as the main topic.  
8. Make an overall judgement on how well the rephrased question can help a third party understand the inquiry in the context of the user's situation without needing to refer back to previous interactions. 

Follow Up Input: {question}
{format_instructions}
"""

ANSWER_TEMPLATE = """Follow these steps in your response to the given user question:
1. Begin by analysing the given user message in the context of financial grants or schemes for caregivers, persons with disabilities and/or the elderly. Identify the main topic, intent and inquiry by the user. 
2. Generate a clear, comprehensible and concise response without making any assumptions. If the user is asking for examples, include a list of least 2 and up to 3 examples in your response without too much explanation. Do not explicitly reveal or make known your intention of giving them a summary. 
3. Ensure that your response is <800 characters. 
4. Ensure that language used should always be respectful, empathetic, not condescending and not derogatory. Always match the complexity of language used in the given user question. 
5. Ensure that throughout the answering process, your response directly addresses the core topic and intent of the user question based on the given context: 
{context}
6. Make an overall judgement how well your final response addresses the user's question. 

Question: {question}
Answer: 
"""

INFO_TEMPLATE = """Follow these steps to generate a response to the given topic and user question:

Topic: {topic}
Question: {question} 

1. Begin by understanding if the given topic is about a specific grant or scheme, or if it covers a broader scope.  
2. Analyse the following context to extract relevant information to the given question: 
{context}
If the given topic is about a specific grant or scheme, this should include details about specific grants, eligibility criteria, expected benefits and application processes. 
If the given topic or question is broader in scope, skip to Step 5.
3. Ensure the inclusion of fixed sections with these specific titles in your response: About the grant, Eligibility, Expected benefits, Application process. Each of these titles should have corresponding content that provide comprehensive information extracted from the context about the grant or scheme to help user's understanding. 
4. Assess if there are remaining relevant details extracted from the context in Step 2 other than those already covered in Step 3. If no, skip to Step 7.
5. Assess if this extracted information from the context contains complex topics that the user may need more details or explanation for better understanding. If yes, assess if it can be broken down into mutually-exclusive sub-topics for clarity and ease of understanding. Ensure that each sub-topic is of sufficient complexity to warrant its own section. If there is no extracted information, or if the information if simple enough not to require additional explanation, skip all remaining steps and return nothing. 
Choose a maximum of the top 5 most relevant sub-topics as a part of your response.
6. If such mutually-exclusive sub-topics are identified, partition the response accordingly, and assign each sub-topic as a distinct title. Ensure each of these titles have content that seamlessly integrate relevant information from the given context.
7. Throughout the response crafting process, prioritise clarity and coherence. Ensure that the response is structured logically, facilitating easy navigation and understanding for the user. Details in each content should be self-contained and not mentioned in another content within the same response. 
8. Ensure that language used should always be respectful, empathetic, not condescending and not derogatory. Always match the complexity of language used in the given user question. 

{format_instructions}
"""