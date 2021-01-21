import React from "react";
import LandingPage from "./components/LandingPage";
import Table from "./components/Table";
import Error from "./components/Error";
import "./css/App.css";
import { Switch, Route } from "react-router-dom";

export default function App() {
  return (
    <main>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/table" component={Table} />
        <Route component={Error} />
      </Switch>
    </main>
  );
}
