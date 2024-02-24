import React from "react";

import styles from "./LandingPage.module.css";
import { GrantEligibilityDisplay } from "src/components/GrantEligibilityDisplay/GrantEligibilityDisplay";
import { GenAIDisplay } from "src/components/GenAIDisplay/GenAIDisplay";
import { AppProvider } from "src/components/AppContext/AppProvider";

export const LandingPage = () => {
  return (
    <div className={styles["wrapper"]}>
      <AppProvider>
        <GrantEligibilityDisplay className={styles["context-container"]} />
        <GenAIDisplay className={styles["chat-container"]} />
      </AppProvider>
    </div>
  );
};
