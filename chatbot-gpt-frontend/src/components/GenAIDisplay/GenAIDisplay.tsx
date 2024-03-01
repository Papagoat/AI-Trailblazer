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
import { ReactComponent as RightArrowIcon } from "src/assets/right-arrow.svg";

interface IProps {
  className: string;
}

export const GenAIDisplay = ({ className }: IProps) => {
  const displayContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const suggestionContainerRef = useRef<HTMLElement>(null);
  const lastAIMessageRef = useRef<HTMLDivElement>(null);
  const lastHumanMessageRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState<string>("");
  const [displayHeight, setDisplayHeight] = useState<number>();
  const { messages, suggestions, isLoading, setMessages, sendMessage } =
    useContext(AppContext);

  const sendSuggestedResponse = async (e: React.MouseEvent<HTMLElement>) => {
    const text = (e.target as HTMLElement).innerText;
    const message = {
      text,
      sender: "user",
      topic: "",
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
      topic: "",
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
  }, []);

  // Dynamically set scroll container height
  useEffect(() => {
    if (
      suggestionContainerRef.current &&
      scrollContainerRef.current &&
      displayHeight
    ) {
      const scrollContainerHeight = scrollContainerRef.current.clientHeight;
      const availableSpace =
        displayHeight - suggestionContainerRef.current.clientHeight;

      if (scrollContainerHeight > availableSpace) {
        scrollContainerRef.current.style.height = `${availableSpace}px`;
      }

    }
  }, [messages, displayHeight]);

  // Scroll to bottom of scroll container
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

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
            <RightArrowIcon className={styles["right-arrow-icon"]} />
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
