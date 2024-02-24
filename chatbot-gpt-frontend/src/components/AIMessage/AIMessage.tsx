import React, { forwardRef } from "react";
import { DaisyLogoImage } from "src/assets";

import styles from "./AIMessage.module.css";

interface IProps {
  isLatest: boolean;
  aiMessage: string;
}

export const AIMessage = forwardRef<HTMLDivElement, IProps>(
  ({ isLatest = false, aiMessage }, ref) => {
    return (
      <div className={styles["wrapper"]} ref={ref}>
        <DaisyLogoImage className={styles["daisy-logo"]} />
        <p className={isLatest ? styles["is-latest"] : undefined}>
          {aiMessage}
        </p>
      </div>
    );
  }
);
