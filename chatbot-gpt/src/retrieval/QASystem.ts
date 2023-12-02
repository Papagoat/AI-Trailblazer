import { LLMChain } from "langchain/chains";
import { ChatGoogleVertexAI } from "langchain/chat_models/googlevertexai";
import { VectorStoreRetriever } from "langchain/dist/vectorstores/base";
import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { RunnableBranch, RunnableSequence } from "langchain/schema/runnable";
import { formatDocumentsAsString } from "langchain/util/document";
import { FaissStore } from "langchain/vectorstores/faiss";
import {
  questionGeneratorTemplate,
  questionPromptTemplate,
} from "./promptTemplates";
import { BufferMemory } from "langchain/memory";

// https://js.langchain.com/docs/use_cases/question_answering/advanced_conversational_qa
export class QASystem {
  private model: ChatGoogleVertexAI;
  private retriever: VectorStoreRetriever<FaissStore>;
  private memory: BufferMemory;
  private questionPromptTemplate: PromptTemplate;
  private questionGeneratorTemplate: PromptTemplate;

  public static fullChain: RunnableSequence<
    {
      question: string;
    },
    any
  >;

  constructor(retriever: VectorStoreRetriever<FaissStore>) {
    this.model = new ChatGoogleVertexAI({
      temperature: 0.7,
    });

    this.memory = new BufferMemory({
      memoryKey: "chatHistory",
    });

    this.questionPromptTemplate = questionPromptTemplate;
    this.questionGeneratorTemplate = questionGeneratorTemplate;
    this.retriever = retriever;
    if (!QASystem.fullChain) {
      QASystem.fullChain = this.createFullChain();
    }
  }

  private serializeChatHistory = (chatHistory: string | Array<string>) => {
    if (Array.isArray(chatHistory)) {
      return chatHistory.join("\n");
    }
    return chatHistory;
  };

  private handleProcessQuery = async (input: {
    question: string;
    context: string;
    chatHistory?: string | Array<string>;
  }) => {
    const chain = new LLMChain({
      llm: this.model,
      prompt: this.questionPromptTemplate,
      outputParser: new StringOutputParser(),
    });

    const { text } = await chain.call({
      ...input,
      chatHistory: this.serializeChatHistory(input.chatHistory ?? ""),
    });

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

  private createAnswerQuestionChain = () => {
    return RunnableSequence.from([
      {
        question: (input: {
          question: string;
          chatHistory?: string | Array<string>;
        }) => input.question,
      },
      {
        question: (previousStepResult: {
          question: string;
          chatHistory?: string | Array<string>;
        }) => previousStepResult.question,
        chatHistory: (previousStepResult: {
          question: string;
          chatHistory?: string | Array<string>;
        }) => this.serializeChatHistory(previousStepResult.chatHistory ?? ""),
        context: async (previousStepResult: {
          question: string;
          chatHistory?: string | Array<string>;
        }) => {
          // Fetch relevant docs and serialize to a string.
          const relevantDocs = await this.retriever.getRelevantDocuments(
            previousStepResult.question
          );
          const serialized = formatDocumentsAsString(relevantDocs);
          return serialized;
        },
      },
      this.handleProcessQuery,
    ]);
  };

  private createGenerateQuestionChain = () => {
    return RunnableSequence.from([
      {
        question: (input: {
          question: string;
          chatHistory: string | Array<string>;
        }) => input.question,
        chatHistory: async () => {
          const memoryResult = await this.memory.loadMemoryVariables({});
          return this.serializeChatHistory(memoryResult.chatHistory ?? "");
        },
      },
      this.questionGeneratorTemplate,
      this.model,
      // Take the result of the above model call, and pass it through to the
      // next RunnableSequence chain which will answer the question
      {
        question: (previousStepResult: { text: string }) =>
          previousStepResult.text,
      },
      this.createAnswerQuestionChain,
    ]);
  };

  private createBranch = () => {
    return RunnableBranch.from([
      [
        async () => {
          const memoryResult = await this.memory.loadMemoryVariables({});
          const isChatHistoryPresent = !memoryResult.chatHistory.length;

          return isChatHistoryPresent;
        },
        this.createAnswerQuestionChain,
      ],
      [
        async () => {
          const memoryResult = await this.memory.loadMemoryVariables({});
          const isChatHistoryPresent =
            !!memoryResult.chatHistory && memoryResult.chatHistory.length;

          return isChatHistoryPresent;
        },
        this.createGenerateQuestionChain,
      ],
      this.createAnswerQuestionChain,
    ]);
  };

  private createFullChain = () => {
    return RunnableSequence.from([
      {
        question: (input: { question: string }) => input.question,
      },
      this.createBranch,
    ]);
  };
}