import React from "react";
import LandingPage from "./components/LandingPage";
import Table from "./components/Table";
import Error from "./components/Error";
import "./css/App.css";
import { Switch, Route } from "react-router-dom";
import Tree from "./components/Tree";
import Header from "./components/Header.js";

export default function App() {
  return (
    <main>
      <Header />
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/table" component={Table} />
        <Route path="/tree" component={Tree} />
        <Route component={Error} />
      </Switch>
    </main>
  );
}
