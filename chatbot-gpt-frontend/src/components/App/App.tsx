import React from "react";
import { Route, Routes } from "react-router-dom";

import { NavBar } from "../NavBar/NavBar";
import { LandingPage } from "../LandingPage/LandingPage";

import styles from "./App.module.css";

const App = () => {
  return (
    <div className={styles["wrapper"]}>
      <NavBar />
      <Routes>
        <Route path={"/"} element={<LandingPage />} />
        <Route path={"/about"} element={<>About Page</>} />
      </Routes>
    </div>
  );
};

export default App;
