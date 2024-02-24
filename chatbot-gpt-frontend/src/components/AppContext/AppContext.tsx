import { createContext } from "react";

interface IMessage {
  text: string;
  sender: string;
}

interface IAppContext {
  descriptions: string[];
  messages: IMessage[];
  isLoading: boolean;
  suggestions: string[];
  setMessages: (messages: IMessage[]) => void;
  sendMessage: (message: string) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
}
export const AppContext = createContext<IAppContext>({
  descriptions: [],
  messages: [],
  isLoading: false,
  suggestions: [],
  setMessages: () => {},
  sendMessage: async () => {},
  setIsLoading: () => {},
});
