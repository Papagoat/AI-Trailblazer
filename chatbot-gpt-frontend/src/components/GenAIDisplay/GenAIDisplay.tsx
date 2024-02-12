import React, { FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";

import styles from "./GenAIDisplay.module.css";
import { AIMessage } from "../AIMessage/AIMessage";
import { HumanMessage } from "../HumanMessage/HumanMessage";
import { StarsImage } from "src/assets";
import { ChatBox } from "../ChatBox/ChatBox";
import { ScrollContainer } from "../ScrollContainer/ScrollContainer";

interface IProps {
  className: string;
}

export const GenAIDisplay = ({ className }: IProps) => {
  const displayContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const interactionContainerRef = useRef<HTMLElement>(null);

  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "I want to find out if I’m eligible for grants.",
    "I want to know about grant application procedures and how long it might take.",
    "I don’t know what I’m looking for yet.",
  ]);
  const [displayHeight, setDisplayHeight] = useState<number>();
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([
    {
      sender: "bot",
      text: "Hello, I’m Daisy. I’ll be helping you figure out your care support options from the government.\n\nIs there a specific type of support you are looking for? Ask me in your own words or pick a suggestion.",
    },
  ]);

  const sendMessage = async (message: string) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/message`,
        { message }
      );

      const { answer, suggested_responses : suggestions } = response.data;

      const botMessage = {
        text: answer,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setSuggestions(suggestions);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Error occurred while sending message.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const sendSuggestedResponse = async (e: React.MouseEvent<HTMLElement>) => {
    const text = (e.target as HTMLElement).innerText;

    const message = {
      text,
      sender: "user",
    };

    setInput(text);
    setMessages([...messages, message]);
    setIsLoading(true); // Start loading
    await sendMessage(text);
    setIsLoading(false); // Stop loading
    setInput("");
  };

  const sendMessageHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const message = {
      text: input,
      sender: "user",
    };

    setMessages([...messages, message]);
    setIsLoading(true); // Start loading
    await sendMessage(input);
    setIsLoading(false); // Stop loading
    setInput("");
  };

  useEffect(() => {
    const displayContainerHeight = displayContainerRef.current?.clientHeight;
    setDisplayHeight(displayContainerHeight);
  }, []);

  useEffect(() => {
    if (
      scrollContainerRef.current &&
      interactionContainerRef.current &&
      displayHeight
    ) {
      const scrollContainerHeight = scrollContainerRef.current.offsetHeight;
      const interactionContainerHeight =
        interactionContainerRef.current.clientHeight;
      const availableSpace = displayHeight - interactionContainerHeight;

      if (scrollContainerHeight > availableSpace) {
        scrollContainerRef.current.style.height = `${availableSpace}px`;
      }

      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, displayHeight, scrollContainerRef, interactionContainerRef]);

  return (
    <div
      className={`${styles["wrapper"]} ${className}`}
      ref={displayContainerRef}
    >
      <ScrollContainer
        className={`${styles["scroll-container"]}`}
        ref={scrollContainerRef}
      >
        {messages.map((m, index) => {
          return m.sender === "user" ? (
            <HumanMessage key={index} humanMessage={m.text} />
          ) : (
            <AIMessage
              key={index}
              isLatest={index === messages.length - 1 ? true : false}
              aiMessage={m.text}
            />
          );
        })}
        {isLoading && <span className={styles["loader"]}></span>}
      </ScrollContainer>

      <section
        className={styles["proactive-interaction-wrapper"]}
        ref={interactionContainerRef}
      >
        <div className={styles["nudge-section"]}>
          <StarsImage />
          <p>
            Describe the situation in your own words or select a suggestion
            below
          </p>
        </div>
        {suggestions.map((suggestion, index) => (
          <span
            key={index}
            className={styles["prompt-suggestion"]}
            onClick={sendSuggestedResponse}
          >
            <p>{suggestion}</p>
          </span>
        ))}
        <ChatBox
          input={input}
          inputHandler={(e) => setInput(e.target.value)}
          placeholder={"Reply in your own words..."}
          sendMessageHandler={sendMessageHandler}
          disabled={isLoading}
        />
      </section>
    </div>
  );
};
