import React from "react";

import styles from "./HumanMessage.module.css";

interface IProps {
  humanMessage: string;
}

export const HumanMessage = ({ humanMessage }: IProps) => {
  return (
    <div className={styles["wrapper"]}>
      <p>{humanMessage}</p>
    </div>
  );
};
