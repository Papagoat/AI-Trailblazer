import React from "react";
import styles from "./DetailPanel.module.css";

interface IProps {
  children: React.ReactNode;
}

export const DetailPanel = ({ children }: IProps) => {
  return <section className={styles["wrapper"]}>{children}</section>;
};
