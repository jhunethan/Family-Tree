import React from "react";
import "./css/App.css";
import { Switch, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import Axios from "axios";

import LandingPage from "./components/LandingPage";
import Table from "./components/Table";
import Error from "./components/Error";
import Tree from "./components/Tree";
import Header from "./components/Header.js";
import Resetpassword from "./components/Resetpassword";

export default function App() {
  //ping backend and check if database is working
  Axios.get("https://layfamily.herokuapp.com/testconnection").then((result) => {
    console.log(result);
  });

  return (
    <main>
      <CookiesProvider>
        <Header />
        <Switch>
          <Route exact path="/" render={() => <LandingPage />} />
          <Route path="/table" render={() => <Table />} />
          <Route path="/tree" render={() => <Tree />} />
          <Route path="/reset-password" render={() => <Resetpassword />} />
          <Route component={Error} />
        </Switch>
      </CookiesProvider>
    </main>
  );
}
