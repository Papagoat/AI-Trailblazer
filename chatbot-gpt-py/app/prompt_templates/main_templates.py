STANDALONE_TEMPLATE = """Your task is to refine a given user question by weaving in relevant details from a provided chat history. Craft a rephrased question that can be understood independently, capturing the essence of the original query while incorporating contextual nuances. Follow the steps below while ensuring that each transition in thought maintains coherence and clarity, resulting in a refined, standalone question reflective of the conversation's progression: 

1. Begin by comprehending the given user question thoroughly. This entails identifying the main topic, intent, and any specific details or nuances in the query. 
2. Make a judgement if the main topic is related to a specific grant or scheme. If yes, ensure that the exact name of the grant or scheme is set as the main topic. 
3. Analyse the provided chat history and make a judgement if there is relevant information that can enhance the understanding of the given user question. Look for context, background details or previous discussions related to the main topic at hand. If there is no relevant judgement, skip the remaining steps and return the given user question as your response without making any changes. 
{chat_history}
4.. Extract and integrate the relevant context into the rephrased question without making any assumptions outside of the given chat history. Transition smoothly from the user's original inqurity to incorporating details from the chat history, ensuring coherence and logical progression. 
5.. Preserve the essence of the user's original question throughout the rephrasing process. Although incorporating additional context, ensure that the core topic and intent remain unchanged. 
6. Craft the rephrased question in a manner that is standalone, clear and comprehensible. Ensure that a third party can gain a deep understanding of the inquiry in the context of the user's situation without needed to refer back to previous interactions. 
7. Make an overall judgement on how well the rephrased question can help a third party understand the inquiry in the context of the user's situation without needing to refer back to previous interactions. 

Follow Up Input: {question}
{format_instructions}
"""

ANSWER_TEMPLATE = """Follow these steps in your response to the given user question:
1. Begin by analysing the given user message in the context of financial grants or schemes for caregivers, persons with disabilities and/or the elderly. Identify the main topic, intent and inquiry by the user. 
2. Generate a clear, comprehensible and concise response without making any assumptions. If the user is asking for examples, include a list of least 2 and up to 3 examples in your response without too much explanation. 
3. Ensure that language used should always be respectful, emphathetic, not condescending and not derogaratory. Always mmatch the complexity of language used in the given user question. 
4. Ensure that throughout the answering process, your response directly addresses the core topic and intent of the user question based on the given context: 
{context}
5. Make an overall judgement how well your final response addresses the user's question. 

Question: {question}
Answer: 
"""

# COT implementation
# ANSWER_TEMPLATE = """Try to answer the question based on the following context:
# {context}

# Question: {question}

# Topic: {topic}

# Examples: {examples}

# Follow these steps in your response:
# 1. Understanding the intent of the question.
# 2. Use the examples a reference in helping you understanding the nature of the input question.
# 3. These examples are only teaching you how to navigate a conversation around a specific topic. You should not replace the topic with the example topic.
# 4. In addition, reference the topic when crafting your answer.
# 3. Be precise and concise with your answer. Do not include half-finished sentences.

# {format_instructions}
# """

INFO_TEMPLATE ="""Follow these steps to generate a response to the given topic and user question:
Topic: {topic}
Question: {question} 


1. Begin by analysing if the given topic and question pertains to a specific grant or scheme, or if it covers a broader topic. 
2. Analyse the following context to extract relvant information to the given question: 
{context}
If applicable, this should include details about specific grants, eligibility criteria, expected benefits and application processes. 
3. If the user's question is about a specific grant or scheme, dynamically assign the name of the grant or scheme as the response topic. If the given topic or question is broader in scope, designate {topic} as the response topic then skip to Step 6. 
4. Ensure the inclusion of fixed sections with these specific titles in your response: About the grant, Eligibility, Expected benefits, Application process.These sections provide comprehensive information about the grant or scheme to help user's understanding. 
5. Assess if there are remaining relevant details from the extracted information in Step 2 other than those aready covered in Step 4. If no, skip to Step 8.
6. Assess if the response can be broken down into mutually-exclusive sub-topics for clarity and ease of understanding. 
7. If mutually-exclusive sub-topics are identified, partition the response accordingly, with each sub-topic serving as a distinct title. Ensure seamless integration of relevant information from the given context into each sub-topic. 
8. If relevant, include a section titled 'Examples'. Provide a minimum of two relevant examples to illustrate key points or concepts, enhancing user's comprehension. 
9. Throughout the response crafting process, prioritise clarity and coherence. Ensure that the response is structured logically, facilitating easy navigation and understanding for the user. Details in each sub-topic should be self-contained and not mentioned in another sub-topic within the same response. 

{format_instructions}
"""