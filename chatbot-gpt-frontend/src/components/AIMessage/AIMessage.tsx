import React from "react";
import { DaisyLogoImage } from "src/assets";

import styles from "./AIMessage.module.css";

interface IProps {
  isLatest: boolean;
  aiMessage: string;
}

export const AIMessage = ({ isLatest = false, aiMessage }: IProps) => {
  return (
    <div className={styles["wrapper"]}>
      <DaisyLogoImage className={styles["daisy-logo"]} />
      <p className={isLatest ? styles["is-latest"] : undefined}>{aiMessage}</p>
    </div>
  );
};
