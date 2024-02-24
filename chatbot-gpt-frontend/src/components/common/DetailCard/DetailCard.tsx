import React from "react";
import styles from "./DetailCard.module.css";

interface IProps {
  title: string;
  content: string;
}

export const DetailCard = ({ title, content }: IProps) => {
  return (
    <div className={styles["wrapper"]}>
      <p className={styles["title"]}>{title}</p>
      <div className={styles["content"]}>{content}</div>
    </div>
  );
};
