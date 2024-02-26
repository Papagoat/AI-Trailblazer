import { createContext } from "react";

interface IMessage {
  text: string;
  sender: string;
}

interface IInfoItem {
  title: string;
  content: string;
}

export interface IInformation {
  topic: string;
  details: IInfoItem[];
}

interface IAppContext {
  information: IInformation[];
  messages: IMessage[];
  isLoading: boolean;
  suggestions: string[];
  setMessages: (messages: IMessage[]) => void;
  sendMessage: (message: string) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
}
export const AppContext = createContext<IAppContext>({
  information: [],
  messages: [],
  isLoading: false,
  suggestions: [],
  setMessages: () => {},
  sendMessage: async () => {},
  setIsLoading: () => {},
});
