import React, { useContext, useEffect, useRef, useState } from "react";

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
  const { descriptions } = useContext(AppContext);

  const [displayHeight, setDisplayHeight] = useState<number>();
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    setDetails((prevDetails) => [...prevDetails, ...descriptions]);
  }, [descriptions]);

  // TODO: Might want to move into AppContext and implement the same height
  // for both GrantEligibilityDisplay / GenAIDisplay
  useEffect(() => {
    const displayContainerHeight = displayContainerRef.current?.offsetHeight;
    setDisplayHeight(displayContainerHeight);
    if (displayContainerRef.current) {
      displayContainerRef.current.style.height = `${displayHeight}px`;
    }
  }, [displayHeight]);

  return (
    <div
      className={`${styles["wrapper"]} ${className}`}
      ref={displayContainerRef}
    >
      <InitialDisplay />
      {details.length > 0 && (
        <>
          {details.map((d, i) => (
            <DetailPanel key={i}>
              <DetailCard title={"Title of nested card"} content={d} />
            </DetailPanel>
          ))}
        </>
      )}
    </div>
  );
};
