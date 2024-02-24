import React, { forwardRef } from "react";

import styles from "./HumanMessage.module.css";

interface IProps {
  humanMessage: string;
}

export const HumanMessage = forwardRef<HTMLDivElement, IProps>(
  ({ humanMessage }, ref) => {
    return (
      <div className={styles["wrapper"]} ref={ref}>
        <p>{humanMessage}</p>
      </div>
    );
  }
);
