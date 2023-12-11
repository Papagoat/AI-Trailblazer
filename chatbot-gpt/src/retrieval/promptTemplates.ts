import { PromptTemplate } from "langchain/prompts";

const condenseQuestionTemplate = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chatHistory}
Follow Up Input: {question}
Standalone question:`;

const answerTemplate = `Answer the question based only on the following context:
  {context}
  
  Question: {question}
  `;

export const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
  condenseQuestionTemplate
);

export const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate);