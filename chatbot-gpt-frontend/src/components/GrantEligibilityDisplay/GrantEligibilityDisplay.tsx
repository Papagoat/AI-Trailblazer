import React from "react";

import styles from "./GrantEligibilityDisplay.module.css";

import { DaisyWordImage, EllipsesGroupImage } from "src/assets";

interface IProps {
  className: string;
}

export const GrantEligibilityDisplay = ({ className }: IProps) => {
  return (
    <div className={`${styles["wrapper"]} ${className}`}>
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
    </div>
  );
};
