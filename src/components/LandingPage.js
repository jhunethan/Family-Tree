import React, { useState } from "react";
import "../css/LandingPage.css";
import { useHistory } from "react-router-dom";
import * as $ from "jquery";
import Axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
// import { useCookies } from "react-cookie";

function SignUp(props) {
  const [user, setUser] = useState({});

  function validateEmail() {
    if (
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        user["email"]
      )
    ) {
      return true;
    }
    return false;
  }

  const checkChanges = (method) => {
    let tempUser = user;
    tempUser[method] = $(`#signup-${method}`).val();
    setUser(tempUser);
  };

  const submit = () => {
    let valid = true;
    //check for empty fields
    for (const x of ["name", "email", "password"]) {
      if (!user[x]) {
        valid = false;
        toast.error(`empty ${x}`);
      }
    }

    if (!validateEmail() && valid) {
      valid = false;
      toast.error("invalid email");
    }

    if (valid) {
      Axios.post("http://localhost:5000/api/signup", {
        userdetails: user,
      }).then((result) => console.log(result));
    }
  };

  return (
    <form>
      <h3>Register</h3>

      <div className="form-group">
        <label>Full name</label>
        <input
          type="text"
          className="form-control"
          id="signup-name"
          placeholder="Full name"
          onChange={() => checkChanges("name")}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          className="form-control"
          id="signup-email"
          placeholder="Enter email"
          onChange={() => checkChanges("email")}
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          id="signup-password"
          placeholder="Enter password"
          onChange={() => checkChanges("password")}
        />
      </div>

      <button
        type="button"
        className="btn btn-dark btn-lg btn-block"
        onClick={() => {
          submit();
        }}
      >
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
  const [user, setUser] = useState({});

  const checkChanges = (method) => {
    let tempUser = user;
    tempUser[method] = $(`#login-${method}`).val();
    setUser(tempUser);
  };

  const submit = () => {
    let valid = true;
    //check for empty fields
    for (const x of ["email", "password"]) {
      if (!user[x]) {
        valid = false;
        toast.error(`empty ${x}`);
      }
    }

    if (valid) console.log("valid input");
  };

  return (
    <form>
      <h3>Log in</h3>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          id="login-email"
          className="form-control"
          placeholder="Enter email"
          onClick={() => checkChanges("email")}
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          id="login-password"
          className="form-control"
          placeholder="Enter password"
          onClick={() => checkChanges("password")}
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

      <button
        type="button"
        className="btn btn-dark btn-lg btn-block"
        onClick={() => submit()}
      >
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
      <ToastContainer position="bottom-right" autoClose={5000} limit={5} />
    </div>
  );
}
