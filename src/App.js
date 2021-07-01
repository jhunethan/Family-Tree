import React, { useState } from "react";
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
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [Auth, setAuth] = useState(false);

  //ping backend and check if database is working
  Axios.get(process.env.REACT_APP_API+"testconnection").then((result) => {
    console.log(result);
  });

  return (
    <main>
      <CookiesProvider>
        <Header />
        <Switch>
          <Route
            exact
            path="/"
            render={() => <LandingPage setAuth={setAuth} />}
          />
          <ProtectedRoute path="/tree" Auth={Auth} component={Tree} />
          <ProtectedRoute path="/table" Auth={Auth} component={Table} />
          <Route path="/reset-password" render={() => <Resetpassword />} />
          <Route component={Error} />
        </Switch>
      </CookiesProvider>
    </main>
  );
}
