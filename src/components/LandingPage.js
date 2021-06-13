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
    } catch (err) {
      return "invalid input";
    }
  }

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

  const checkChanges = (method) => {
    let tempUser = user;
    let val = $.trim($(`#signup-${method}`).val());
    if (method === "name") val = capitalize(val);
    tempUser[method] = val;
    setUser(tempUser);
  };

  const passwordValidation = () => {
    let Min_Password_Length = 5,
      password_Input = $("#signup-password").val(),
      password_Input_Repeat = $("#signup-password-repeat").val();

    if (password_Input.length < Min_Password_Length) {
      toast.error("Password must be longer than 5 characters");
      return false;
    }
    if (password_Input !== password_Input_Repeat) {
      toast.error("Passwords dont match, please re-enter");
      return false;
    }
  };

  const submit = () => {
    let valid = true;

    for (const x of ["name", "email", "password"]) {
      if (!user[x]) {
        valid = false;
        toast.error(`empty ${x}`);
      }
    }

    if (!validateEmail(user["email"]) && valid) {
      valid = false;
      toast.error("invalid email", { toastId: "invalidEmail" });
    }

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
    <form id="form-register">
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
    <form id="form-login">
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
  if (props.view === "reset") return <ResetPassword />;
  if (props.view === "login")
    return (
      <Login ResetPassword={props.ResetPassword} setSignUp={props.setSignUp} />
    );
  if (props.view === "signup") return <SignUp setLogin={props.setLogin} />;
  
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
}

export default function LandingPage(props) {
  const [view, setView] = useState("");
  var history = useHistory();

  $("ul.header-navigation").addClass("hidden");

  return (
    <div className="wrapper">
      <div className="header">
        <h1 className="landing-title" onClick={() => setView("")}>
          Lay Family Tree
        </h1>
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
      <ToastContainer position="bottom-right" autoClose={5000} limit={5} />
    </div>
  );
}
