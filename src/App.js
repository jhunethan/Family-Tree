import React, { useState } from "react";
import "./css/App.css";
import { Switch, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import Table from "./components/Table";
import Error from "./components/Error";
import Tree from "./components/Tree";
import Header from "./components/Header.js";

export const MyContext = React.createContext("default author");

export default function App() {
  const [author, setAuthor] = useState("default author");

  const updateAuthor = (input) => {
    setAuthor(input);
  };

  return (
    <main>
      <MyContext.Provider value={author}>
        <Header />
        <Switch>
          <Route exact
            path="/"
            render={() => <LandingPage setAuthor={updateAuthor} />}
          />
          <Route path="/table" render={() => <Table author={author} />} />
          <Route path="/tree" render={() => <Tree author={author} />} />
          <Route component={Error} />
        </Switch>
      </MyContext.Provider>
    </main>
  );
}
