import React, { forwardRef } from "react";

import styles from "./ScrollContainer.module.css";

interface IProps {
  className: string;
  children?: React.ReactNode;
}

export const ScrollContainer = forwardRef<HTMLElement, IProps>(
  ({ className, children }: IProps, ref) => {
    return (
      <section className={`${styles["wrapper"]} ${className}`}  ref={ref}>
        {children}
      </section>
    );
  }
);
