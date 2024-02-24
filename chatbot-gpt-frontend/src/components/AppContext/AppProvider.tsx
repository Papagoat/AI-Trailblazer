import axios from "axios";
import React from "react";
import { useState } from "react";

import { AppContext } from "./AppContext";

interface IAppProvider {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: IAppProvider) => {
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([
    {
      sender: "bot",
      text: "Hello, I’m Daisy. I’ll be helping you figure out your care support options from the government.\n\nIs there a specific type of support you are looking for? Ask me in your own words or pick a suggestion.",
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "I want to find out if I’m eligible for grants.",
    "I want to know about grant application procedures and how long it might take.",
    "I don’t know what I’m looking for yet.",
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true)
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/message`,
        { message }
      );

      const {
        answer,
        reply_options: suggestions,
        descriptions,
      } = response.data;

      const botMessage = {
        text: answer,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setSuggestions(suggestions);
      setDescriptions(descriptions);
      setIsLoading(false)
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Error occurred while sending message.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsLoading(false)
    }
  };

  return (
    <AppContext.Provider
      value={{
        descriptions,
        messages,
        isLoading,
        suggestions,
        setMessages,
        sendMessage,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
