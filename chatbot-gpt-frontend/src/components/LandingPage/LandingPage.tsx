import React from "react";

import styles from "./LandingPage.module.css";
import { GrantEligibilityDisplay } from "src/components/GrantEligibilityDisplay/GrantEligibilityDisplay";
import { GenAIDisplay } from "../GenAIDisplay/GenAIDisplay";

export const LandingPage = () => {
  return (
    <div className={styles["wrapper"]}>
      <GrantEligibilityDisplay className={styles["context-container"]} />
      <GenAIDisplay className={styles["chat-container"]}/>
    </div>
  );
};