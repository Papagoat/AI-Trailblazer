import { PromptTemplate } from "langchain/prompts";

/**
   * Create a prompt template for generating an answer based on context and
   * a question.
   *
   * Chat history will be an empty string if it's the first question.
   *
   * inputVariables: ["chatHistory", "context", "question"]
   */
export const questionPromptTemplate = PromptTemplate.fromTemplate(
  `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
CHAT HISTORY: {chatHistory}
----------------
CONTEXT: {context}
----------------
QUESTION: {question}
----------------
Helpful Answer:`
);

/**
 * Creates a prompt template for __generating a question__ to then ask an LLM
 * based on previous chat history, context and the question.
 *
 * inputVariables: ["chatHistory", "question"]
 */
export const questionGeneratorTemplate =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
----------------
CHAT HISTORY: {chatHistory}
----------------
FOLLOWUP QUESTION: {question}
----------------
Standalone question:`);