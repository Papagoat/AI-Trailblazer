import React, {
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./GenAIDisplay.module.css";
import { AIMessage } from "src/components/AIMessage/AIMessage";
import { HumanMessage } from "src/components/HumanMessage/HumanMessage";
import { DaisyLogoImage, StarsImage } from "src/assets";
import { ChatBox } from "src/components/ChatBox/ChatBox";
import { ScrollContainer } from "src/components/ScrollContainer/ScrollContainer";
import { AppContext } from "src/components/AppContext/AppContext";

interface IProps {
  className: string;
}

export const GenAIDisplay = ({ className }: IProps) => {
  const displayContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const suggestionContainerRef = useRef<HTMLElement>(null);
  const lastAIMessageRef = useRef<HTMLDivElement>(null);
  const lastHumanMessageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState<string>("");
  const [displayHeight, setDisplayHeight] = useState<number>();
  const { messages, suggestions, isLoading, setMessages, sendMessage } =
    useContext(AppContext);

  const sendSuggestedResponse = async (e: React.MouseEvent<HTMLElement>) => {
    const text = (e.target as HTMLElement).innerText;

    const message = {
      text,
      sender: "user",
    };

    setInput(text);
    setMessages([...messages, message]);
    await sendMessage(text);
    setInput("");
  };

  const sendMessageHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const message = {
      text: input,
      sender: "user",
    };

    setMessages([...messages, message]);
    await sendMessage(input);
    setInput("");
  };

  // TODO: Might want to move into AppContext and implement the same height
  // for both GrantEligibilityDisplay / GenAIDisplay
  useEffect(() => {
    if (displayContainerRef.current) {
      const displayContainerHeight = displayContainerRef.current.clientHeight;
      setDisplayHeight(displayContainerHeight);
    }
  }, [displayHeight]);

  useEffect(() => {
    const ELEMENT_GAP = 16;
    if (isLoading) {
      const loader = document.getElementById("loader");
      if (
        scrollContainerRef.current &&
        suggestionContainerRef.current &&
        lastHumanMessageRef.current &&
        messagesEndRef.current &&
        loader
      ) {
        const scrollContainerHeight =
          lastHumanMessageRef.current.clientHeight +
          loader.clientHeight +
          5 * ELEMENT_GAP;

        scrollContainerRef.current.style.height = `${scrollContainerHeight}px`;
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      if (
        scrollContainerRef.current &&
        suggestionContainerRef.current &&
        lastAIMessageRef.current &&
        messagesEndRef.current &&
        displayHeight
      ) {
        const messages = scrollContainerRef.current.children;
        if (messages.length < 3) {
          return;
        }
        const lastHumanMessage = messages[messages.length - 3];
        const scrollContainerHeight =
          lastAIMessageRef.current.clientHeight +
          lastHumanMessage.clientHeight +
          5 * ELEMENT_GAP;
        const availableSpace =
          displayHeight - suggestionContainerRef.current.clientHeight;
        scrollContainerRef.current.style.height = `${Math.min(
          scrollContainerHeight,
          availableSpace
        )}px`;
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [isLoading, displayHeight]);

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
            <HumanMessage
              key={index}
              humanMessage={m.text}
              ref={
                index === messages.length - 1 &&
                messages[messages.length - 1].sender === "user"
                  ? lastHumanMessageRef
                  : undefined
              }
            />
          ) : (
            <AIMessage
              key={index}
              isLatest={index === messages.length - 1 ? true : false}
              aiMessage={m.text}
              ref={
                index === messages.length - 1 &&
                messages[messages.length - 1].sender === "bot"
                  ? lastAIMessageRef
                  : undefined
              }
            />
          );
        })}
        {isLoading && (
          <DaisyLogoImage className={styles["loader"]} id={"loader"} />
        )}
        <div ref={messagesEndRef} />
      </ScrollContainer>

      <section
        className={styles["suggestion-wrapper"]}
        ref={suggestionContainerRef}
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
