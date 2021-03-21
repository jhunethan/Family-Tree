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
  var history = useHistory();

  function capitalize(str) {
    try {
      return str
        .toLowerCase()
        .split(" ")
        .map(function (word) {
          return word[0].toUpperCase() + word.substr(1);
        })
        .join(" ");
    } catch {
      return str;
    }
  }

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
    tempUser[method] =
      method === "name"
        ? $.trim(capitalize($(`#signup-${method}`).val()))
        : $.trim($(`#signup-${method}`).val());
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
      toast.error("invalid email", { toastId: "invalidEmail" });
    }

    const passwordValidation = () => {
      let check = true;
      if ($("#signup-password").val() !== $("#signup-password-repeat").val()) {
        toast.error("Passwords dont match, please re-enter");
        check = false;
      }
      if($("#signup-password").val().length < 5){
        toast.error("Password must be longer than 5 characters");
        check = false;
      }
      return check
    };

    if (!passwordValidation()) valid = false;

    if (valid) {
      Axios.post("https://layfamily.herokuapp.com/api/signup", {
        userdetails: user,
      }).then((result) => {
        if (result.data === "success") history.push("/tree");
        if (result.data === "email exists")
          toast.error(
            "There is already an account with that email, please sign in"
          );
      });
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

      <div className="form-group">
        <label>Re-enter password</label>
        <input
          type="password"
          className="form-control"
          id="signup-password-repeat"
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
  var history = useHistory();

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

    if (valid)
      Axios.post("https://layfamily.herokuapp.com/api/login", {
        userdetails: user,
      }).then((result) => {
        if (result.data === "success") {
          return history.push("/tree");
        }
        toast.error(result.data);
      });
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
          onChange={() => checkChanges("email")}
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          id="login-password"
          className="form-control"
          placeholder="Enter password"
          onChange={() => checkChanges("password")}
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
          <span className="fake-hyperlink" onClick={props.ResetPassword}>
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

function ResetPassword(props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function validateEmail(str) {
    if (
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        str
      )
    ) {
      return true;
    }
    return false;
  }

  const inputHandler = () => {
    let input = $("#reset-password-email").val();
    if (validateEmail(input)) {
      return setEmail(input);
    }
    setEmail("");
  };

  const resetPass = () => {
    if (email) {
      return Axios.post("https://layfamily.herokuapp.com/api/login/resetpass", {
        email: email,
      }).then((result) => {
        if (result.data === "email not found")
          return toast.error(
            "Email address not found, please check your email or try to sign up"
          );
        setSent(true);
      });
    }
    toast.error("Invalid email", { toastId: "invalidEmail" });
  };

  if (sent)
    return (
      <div className="reset-container">
        <h2>Reset request email has to been sent to </h2>
        <h3>{email}</h3>
        <p>
          Please allow a few minutes for the email to be sent, it may also be in
          your spam folder
        </p>
      </div>
    );

  return (
    <div className="reset-container">
      <div>Enter your email to send a password reminder</div>
      <input
        type="Email"
        id="reset-password-email"
        className="form-control"
        placeholder="Enter Email"
        onChange={() => inputHandler()}
      />
      <button
        type="button"
        id="reset-password-password"
        className="btn btn-dark btn-lg btn-block"
        onClick={() => resetPass()}
      >
        Send Password Reminder
      </button>
    </div>
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
  if (props.view === "reset") return <ResetPassword />;
  if (props.view === "login")
    return (
      <Login ResetPassword={props.ResetPassword} setSignUp={props.setSignUp} />
    );
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
            ResetPassword={() => {
              setView("reset");
            }}
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
