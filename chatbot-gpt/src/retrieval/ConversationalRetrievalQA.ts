import { ChatGoogleVertexAI } from "langchain/chat_models/googlevertexai";
import { VectorStoreRetriever } from "langchain/vectorstores/base";
import { BufferMemory } from "langchain/memory";
import { FaissStore } from "langchain/vectorstores/faiss";
import { BaseMessageChunk } from "langchain/schema";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "langchain/schema/runnable";
import { StringOutputParser } from "langchain/schema/output_parser";
import { ANSWER_PROMPT, CONDENSE_QUESTION_PROMPT } from "./promptTemplates";
import { LLMChain } from "langchain/chains";
import { formatDocumentsAsString } from "langchain/util/document";

type ConversationalRetrievalQAChainInput = {
  question: string;
  chatHistory: BaseMessageChunk[];
};

// https://js.langchain.com/docs/expression_language/cookbook/retrieval
export class ConversationalRetrievalQA {
  private model: ChatGoogleVertexAI;
  private retriever: VectorStoreRetriever<FaissStore>;
  private memory: BufferMemory;
  private static fullChain: RunnableSequence<
    ConversationalRetrievalQAChainInput,
    any
  >;
  private static instance: ConversationalRetrievalQA | null = null;

  private constructor(retriever: VectorStoreRetriever<FaissStore>) {
    this.model = new ChatGoogleVertexAI({
      temperature: 0.7,
    });

    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chatHistory",
    });

    this.retriever = retriever;
    if (!ConversationalRetrievalQA.fullChain) {
      ConversationalRetrievalQA.fullChain = this.createFullChain();
    }
  }

  // Gets instance of ConversationalRetrievalQA
  public static getInstance(retriever: VectorStoreRetriever<FaissStore>) {
    if (!ConversationalRetrievalQA.instance) {
      ConversationalRetrievalQA.instance = new ConversationalRetrievalQA(
        retriever
      );
    }

    return ConversationalRetrievalQA.instance;
  }

  // Saves dialogue turn to memory
  private handleProcessQuery = async (input: {
    question: string;
    context: string;
  }) => {
    const chain = new LLMChain({
      llm: this.model,
      prompt: ANSWER_PROMPT,
      outputParser: new StringOutputParser(),
    });

    const { text } = await chain.call(input);
    await this.memory.saveContext(
      {
        human: input.question,
      },
      {
        ai: text,
      }
    );
    return text;
  };

  // Formats chat history
  private formatChatHistory = (chatHistory: BaseMessageChunk[]) => {
    const formattedDialogueTurns = chatHistory.flatMap((message, index) =>
      index % 2 === 0
        ? [
            `Human: ${message.content}\nAssistant: ${
              chatHistory[index + 1]?.content || ""
            }`,
          ]
        : []
    );
    return formattedDialogueTurns.join("\n");
  };

  // Creates standalone question chain
  private createStandaloneQuestionChain = () =>
    RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) =>
          input.question,
        chatHistory: (input: ConversationalRetrievalQAChainInput) => {
          return this.formatChatHistory(input.chatHistory ?? []);
        },
      },
      CONDENSE_QUESTION_PROMPT,
      this.model,
      new StringOutputParser(),
    ]);

  // Creates answer chain
  private createAnswerChain = () =>
    RunnableSequence.from([
      {
        question: new RunnablePassthrough(),
      },
      {
        question: (previousStepResult) => previousStepResult.question,
        context: async (previousStepResult) => {
          const relevantDocs = await this.retriever.getRelevantDocuments(
            previousStepResult.question
          );

          return formatDocumentsAsString(relevantDocs);
        },
      },
      this.handleProcessQuery,
    ]);

  // Creates the full conversationalRetrievalQAChain: standaloneQuestionChain --> answerChain
  private createFullChain = () => {
    const standaloneQuestionChain = this.createStandaloneQuestionChain();
    const answerChain = this.createAnswerChain();
    return standaloneQuestionChain.pipe(answerChain);
  };

  // Method to speak to chain
  public getMessage = async (input: string) => {
    const chatHistory = (await this.memory.loadMemoryVariables({}))[
      "chatHistory"
    ];
    return ConversationalRetrievalQA.fullChain.invoke({
      question: input,
      chatHistory,
    });
  };
}
