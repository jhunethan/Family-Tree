import React from "react";
import "./css/App.css";
import { Switch, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import LandingPage from "./components/LandingPage";
import Table from "./components/Table";
import Error from "./components/Error";
import Tree from "./components/Tree";
import Header from "./components/Header.js";

export default function App() {
  return (
    <main>
      <CookiesProvider>
        <Header />
        <Switch>
          <Route exact path="/" render={() => <LandingPage />} />
          <Route path="/table" render={() => <Table />} />
          <Route path="/tree" render={() => <Tree />} />
          <Route component={Error} />
        </Switch>
      </CookiesProvider>
    </main>
  );
}
