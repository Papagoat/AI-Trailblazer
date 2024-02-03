import React from "react";
import styles from "./NavBar.module.css";
import { NavLink } from "react-router-dom";
import { DaisyLogoWithWordImage } from "src/assets";

export const NavBar = () => {
  return (
    <nav className={styles["wrapper"]}>
      <DaisyLogoWithWordImage />
      <div className={styles["nav-links"]}>
        <NavLink to={"/"}>About</NavLink>
        <NavLink to={"/"}>Privacy</NavLink>
        <NavLink to={"/"}>Recent Chats</NavLink>
        <NavLink to={"/"}>+ New Chat</NavLink>
      </div>
    </nav>
  );
};
