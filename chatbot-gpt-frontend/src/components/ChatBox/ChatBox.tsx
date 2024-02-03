import React, { ChangeEvent, FormEvent, useState } from "react";

import styles from "./ChatBox.module.css";

import { MicrophoneImage } from "src/assets";

interface IProps {
  input: string;
  placeholder: string;
  disabled: boolean;
  inputHandler: (e: ChangeEvent<HTMLInputElement>) => void;
  sendMessageHandler: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ChatBox = ({
  input,
  placeholder,
  disabled,
  inputHandler,
  sendMessageHandler,
}: IProps) => {
  return (
    <form
      className={styles["wrapper"]}
      onSubmit={sendMessageHandler}
    >
      <input
        className={styles["input"]}
        type={"text"}
        value={input}
        disabled={disabled}
        onChange={inputHandler}
        placeholder={placeholder}
      />
      <MicrophoneImage className={styles["microphone-img"]} />
    </form>
  );
};
