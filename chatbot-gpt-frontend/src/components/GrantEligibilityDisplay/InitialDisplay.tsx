import React from "react";

import styles from "./InitialDisplay.module.css";
import { DaisyWordImage, EllipsesGroupImage } from "src/assets";

export const InitialDisplay = () => (
  <section className={styles["wrapper"]} id={"initial-display"}>
    <EllipsesGroupImage className={styles["ellipses-group"]} />
    <div className={styles["branding"]}>
      <section className={styles["title"]}>
        <p>Dependable AI Support for You</p>
        <DaisyWordImage />
      </section>
      <section className={styles["description"]}>
        <p>Your Personal Guide to Government Support</p>
        <p>Get answers on Government Schemes, just ask in your own words.</p>
      </section>
    </div>
  </section>
);
