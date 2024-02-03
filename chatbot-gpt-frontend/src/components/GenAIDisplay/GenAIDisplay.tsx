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
  // TODO: Implement Backend to retrieve prompt suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [displayHeight, setDisplayHeight] = useState<number>();
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([
    {
      sender: "bot",
      text: "Hello, I’m Daisy. I’ll be helping you figure out your care support options from the government.\n\nIs there a specific type of support you are looking for? Ask me in your own words or pick a suggestion.",
    },
  ]);

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const message = {
      text: input,
      sender: "user",
    };
    setMessages([...messages, message]);
    setIsLoading(true); // Start loading

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/message`,
        { message: input }
      );
      const botMessage = {
        text: response.data,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Error occurred while sending message.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

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
        {isLoading && <div className={styles["loader"]}></div>}
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
        {/* TODO: Update this section when prompt suggestion backend is implemented */}
        {suggestions.map((m, index) => (
          <span key={index} className={styles["prompt-suggestion"]}>
            <p>{m}</p>
            <>{"->"}</>
          </span>
        ))}
        <ChatBox
          input={input}
          inputHandler={(e) => setInput(e.target.value)}
          placeholder={"Reply in your own words..."}
          sendMessageHandler={sendMessage}
          disabled={isLoading}
        />
      </section>
    </div>
  );
};
