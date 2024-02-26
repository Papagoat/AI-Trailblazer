import axios from "axios";
import React from "react";
import { filter, unionBy } from "lodash";
import levenshtein from "fast-levenshtein";
import { useState } from "react";

import { AppContext, IInformation } from "./AppContext";

interface IAppProvider {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: IAppProvider) => {
  const [information, setInformation] = useState<IInformation[]>([]);
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
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/message`,
        { message }
      );

      const {
        answer,
        reply_options: suggestions,
        information: newInformation,
      }: {
        answer: string;
        reply_options: string[];
        information: IInformation;
      } = response.data;

      const botMessage = {
        text: answer,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setSuggestions(suggestions);

      if (!newInformation.details.length) {
        setIsLoading(false);
        return
      }

      const THRESHOLD = 20;
      const isSimilar = (a: string, b: string, threshold: number) => {
        const distance = levenshtein.get(a.toLowerCase(), b.toLowerCase());
        return distance < threshold;
      };
      // If the levenshtein distance between the new topic and the current
      // is similar (ie. below a threshold of 10), then it is a match
      const index = information.findIndex(
        (item) => isSimilar(item.topic, newInformation.topic, THRESHOLD)
      );

      // New topic here, add to existing information array
      if (index === -1) {
        setInformation((prevInfo) => [...prevInfo, newInformation]);
      } else {
        // Existing topic. Iterate the child details array.
        // Add non-intersecting child details.title
        setInformation((prevInfo) => {
          // Create a copy of the previous state
          const updatedInfo = [...prevInfo];

          const isSimilar = (a: string, b: string, threshold: number) => {
            const distance = levenshtein.get(a.toLowerCase(), b.toLowerCase());
            return distance < threshold;
          };

          // De-duplicate data
          const combinedDetails = unionBy(
            updatedInfo[index].details,
            newInformation.details,
            "title"
          );

          // Use levenshtein distance to remove similar sub-topics
          const filteredDetails = filter(
            combinedDetails,
            (item, index, self) => {
              for (let i = 0; i < index; i++) {
                if (isSimilar(item.title, self[i].title, THRESHOLD)) {
                  return false;
                }
              }
              return true;
            }
          );

          updatedInfo[index].details = filteredDetails;
          return updatedInfo;
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Error occurred while sending message.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        information,
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
