import React, { useState } from "react";
import "../css/LandingPage.css";
import { useHistory } from "react-router-dom";
import * as $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
// import { useCookies } from "react-cookie";

function SignUp(props) {

  return (
    <form>
      <h3>Register</h3>

      <div className="form-group">
        <label>Full name</label>
        <input type="text" className="form-control" placeholder="Full name" />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
        />
      </div>

      <button type="submit" className="btn btn-dark btn-lg btn-block">
        Register
      </button>
      <p className="forgot-password text-right">
        Already registered{" "}
        <span className="fake-hyperlink" onClick={props.setLogin}>
          log in?
        </span>
      </p>
    </form>
  );
}

function Login(props) {
  return (
    <form>
      <h3>Log in</h3>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
        />
      </div>

      <div className="form-group">
        <div className="custom-control custom-checkbox">
          <input
            type="checkbox"
            className="custom-control-input"
            id="customCheck1"
          />
          <label className="custom-control-label" htmlFor="customCheck1">
            Remember me
          </label>
        </div>
      </div>

      <button type="submit" className="btn btn-dark btn-lg btn-block">
        Sign in
      </button>
      <div className="etc-login-form">
        <p className="no-margin">
          forgot your password?{" "}
          <span className="fake-hyperlink" onClick={props.setLogin}>
            click here
          </span>
        </p>
        <p>
          new user?{" "}
          <span className="fake-hyperlink" onClick={props.setSignUp}>
            create new account
          </span>
        </p>
      </div>
    </form>
  );
}

function LoginControl(props) {
  if (!props.view)
    return (
      <div>
        <div className="landing-buttons">
          <button
            type="button"
            className="btn btn-dark btn-lg btn-block landing-button"
            onClick={props.setLogin}
          >
            Login
          </button>
          <button
            type="button"
            className="btn btn-dark btn-lg btn-block landing-button"
            onClick={props.setSignUp}
          >
            Signup
          </button>
        </div>
        <button
          className="btn btn-dark btn-lg btn-block landing-guest"
          onClick={props.setGuest}
        >
          Continue without login
        </button>
      </div>
    );
  if (props.view === "login") return <Login setSignUp={props.setSignUp} />;
  return <SignUp setLogin={props.setLogin} />;
}

export default function LandingPage(props) {
  const [view, setView] = useState("");

  var history = useHistory();

  // const resetName = () => {
  //   $("div.author-input").removeClass("hidden");
  //   $("div.landing-navigation").addClass("hidden");
  //   $("input.author-input").val("");
  //   $("ul.header-navigation").addClass("hidden");
  // };

  $("ul.header-navigation").addClass("hidden");

  return (
    <div className="wrapper">
      <section className="content-container">
        <div className="header">
          <h1 className="landing-title" onClick={() => setView("")}>
            Lay Family Tree
          </h1>
          {/* <LandingNavigation resetName={resetName} /> */}
          <LoginControl
            view={view}
            setLogin={() => {
              setView("login");
            }}
            setSignUp={() => {
              setView("signup");
            }}
            setGuest={() => {
              setView("");
              history.push("/tree");
            }}
          />
        </div>
      </section>
    </div>
  );
}
