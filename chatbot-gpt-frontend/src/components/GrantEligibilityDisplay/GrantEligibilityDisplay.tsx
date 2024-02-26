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
  const { information } = useContext(AppContext);

  useEffect(() => {
    const initialDisplayElement = document.getElementById("initial-display")
    if (displayContainerRef.current && initialDisplayElement) {
      const displayContainerHeight = displayContainerRef.current.offsetHeight;
      displayContainerRef.current.style.height = `${displayContainerHeight}px`;
      initialDisplayElement.style.height = `${displayContainerHeight}px`;
      console.log(initialDisplayElement.clientHeight, displayContainerHeight)
    }
  },[] );

  return (
    <div
      className={`${styles["wrapper"]} ${className}`}
      ref={displayContainerRef}
    >
      <InitialDisplay />
      {information.length > 0 &&
        information.map((info, i) => (
          <section key={i} className={styles["information-block"]}>
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
