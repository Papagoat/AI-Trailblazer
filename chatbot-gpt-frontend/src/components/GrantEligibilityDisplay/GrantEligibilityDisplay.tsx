import React, { useContext, useEffect, useRef } from "react";

import styles from "./GrantEligibilityDisplay.module.css";

import { AppContext } from "src/components/AppContext/AppContext";
import { InitialDisplay } from "./InitialDisplay";
import { DetailCard } from "src/components/common/DetailCard/DetailCard";
import { DetailPanel } from "src/components/common/DetailPanel/DetailPanel";

interface IProps {
  className: string;
}

export const GrantEligibilityDisplay = ({ className }: IProps) => {
  const displayContainerRef = useRef<HTMLDivElement>(null);
  const { messages, information, isLoading } = useContext(AppContext);

  const getTopicId = (topic: string) =>
    topic.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    const initialDisplayElement = document.getElementById("initial-display");
    if (displayContainerRef.current && initialDisplayElement) {
      const displayContainerHeight = displayContainerRef.current.clientHeight;
      displayContainerRef.current.style.height = `${displayContainerHeight}px`;
      initialDisplayElement.style.height = `${displayContainerHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (!isLoading && displayContainerRef.current) {
      const { topic } = messages[messages.length - 1];
      const topicId = topic.toLowerCase().replace(/\s+/g, "-");
      const element = document.getElementById(`gen-ai-${topicId}`);

      if (element) {
        // Google Chrome not able to simultaneously scrollIntoView multiple
        // elements. Added delay.
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
          });
        }, 500);
      }
    }
  }, [messages, isLoading]);

  return (
    <div
      className={`${styles["wrapper"]} ${className}`}
      ref={displayContainerRef}
    >
      <InitialDisplay />
      {information.length > 0 &&
        information.map((info, i) => (
          <section
            key={i}
            className={styles["information-block"]}
            id={`gen-ai-${getTopicId(info.topic)}`}
          >
            <p className={styles["title"]}>{info.topic}</p>
            <DetailPanel>
              {info.details.map((detail, j) => (
                <DetailCard
                  key={j}
                  title={detail.title}
                  content={detail.content}
                />
              ))}
            </DetailPanel>
          </section>
        ))}
    </div>
  );
};
