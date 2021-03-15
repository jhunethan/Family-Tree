import React, { useState } from "react";
import "../css/LandingPage.css";
// import { Link } from "react-router-dom";
import * as $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
// import { useCookies } from "react-cookie";

// function LandingNavigation(props) {
//   const [cookies, setCookie] = useCookies(["author"]);
//   let authorInput,
//     landingNavigation = "";

//   const changeAuthor = (newAuthor) => {
//     //use context to set author as state of App.js
//     //validation

//     let author = $.trim(newAuthor).replace(/\w\S*/g, (w) =>
//       w.replace(/^\w/, (c) => c.toUpperCase())
//     );

//     if (author.length > 1) {
//       //set Cookie for global access
//       setCookie("author", author, { path: "/" });
//       $("div.author-input").addClass("hidden");
//       $("div.landing-navigation").removeClass("hidden");
//     } else {
//       //empty invalid input
//     }
//   };

//   const setActive = (option) => {
//     if (option === "table") {
//       $("#nav-link-one").addClass("active");
//       $("#nav-link-two").removeClass("active");
//     }
//     if (option === "tree") {
//       $("#nav-link-one").removeClass("active");
//       $("#nav-link-two").addClass("active");
//     }
//     $("ul.header-navigation").removeClass("hidden");
//   };

//   if (cookies.author === undefined) {
//     authorInput = "author-input";
//     landingNavigation = "landing-navigation hidden";
//   } else {
//     authorInput = "author-input hidden";
//     landingNavigation = "landing-navigation";
//   }

//   return (
//     <div>
//       <div className={authorInput}>
//         <input
//           autoComplete="off"
//           type="text"
//           placeholder="Enter your name here"
//           className="author-input"
//           onKeyUp={(event) => {
//             // Number 13 is the "Enter" key on the keyboard
//             if (event.key === "Enter") {
//               // Cancel the default action, if needed
//               event.preventDefault();
//               // Focus on next element
//               changeAuthor($("input.author-input").val());
//             }
//           }}
//         />
//         <button
//           id="landingButton"
//           onClick={() => changeAuthor($("input.author-input").val())}
//         >
//           Enter Name
//         </button>
//       </div>
//       <div className={landingNavigation}>
//         <p>Welcome {cookies.author}</p>
//         <Link to="/table">
//           <button
//             type="button"
//             id="landingButton"
//             onClick={() => setActive("table")}
//           >
//             View Table
//           </button>
//         </Link>
//         <Link to="/tree">
//           <button
//             type="button"
//             id="landingButton"
//             onClick={() => setActive("tree")}
//           >
//             View Tree
//           </button>
//         </Link>
//         <div className="reset-button" onClick={() => props.resetName()}>
//           Not You? Click to re-enter name
//         </div>
//       </div>
//     </div>
//   );
// }

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
  if (props.view === "login") return <Login setSignUp={props.setSignUp} />;
  return <SignUp setLogin={props.setLogin} />;
}

export default function LandingPage(props) {
  const [view, setView] = useState("signup");

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
          <h1>Lay Family Tree</h1>
          {/* <LandingNavigation resetName={resetName} /> */}
          <LoginControl
            view={view}
            setLogin={() => {
              setView("login");
            }}
            setSignUp={() => {
              setView("signup");
            }}
          />
        </div>
      </section>
    </div>
  );
}
