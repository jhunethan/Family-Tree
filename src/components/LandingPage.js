import React from "react";
import "../css/LandingPage.css";
import { Link } from "react-router-dom";
import * as $ from "jquery";
import { useCookies } from "react-cookie";

function LandingNavigation(props) {
  const [cookies, setCookie] = useCookies(["author"]);
  let authorInput,
    landingNavigation = "";

  const changeAuthor = (newAuthor) => {
    //use context to set author as state of App.js
    //validation

    let author = $.trim(newAuthor).replace(/\w\S*/g, (w) =>
      w.replace(/^\w/, (c) => c.toUpperCase())
    );

    if (author.length > 1) {
      //set using function in App.js so it can be passed down
      setCookie("author", author, { path: "/" });
      $("div.author-input").addClass("hidden");
      $("div.landing-navigation").removeClass("hidden");
    } else {
      //empty invalid input
    }
  };

  const setActive = (option) => {
    if (option === "table") {
      $("#nav-link-one").addClass("active");
      $("#nav-link-two").removeClass("active");
    } else {
      $("#nav-link-one").removeClass("active");
      $("#nav-link-two").addClass("active");
    }
    $("ul.header-navigation").removeClass("hidden");
  };

  if (cookies.author === undefined) {
    authorInput = "author-input";
    landingNavigation = "landing-navigation hidden";
  } else {
    authorInput = "author-input hidden";
    landingNavigation = "landing-navigation";
  }

  return (
    <div>
      {" "}
      <div className={authorInput}>
        <input
          autoComplete="off"
          type="text"
          placeholder="Enter your name here"
          className="author-input"
          onKeyUp={(event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element
              changeAuthor($("input.author-input").val());
            }
          }}
        />
        <button
          id="landingButton"
          onClick={() => changeAuthor($("input.author-input").val())}
        >
          Enter Name
        </button>
      </div>
      <div className={landingNavigation}>
        <p>Welcome {cookies.author}</p>
        <Link to="/table">
          <button
            type="button"
            id="landingButton"
            onClick={() => setActive("table")}
          >
            View Table
          </button>
        </Link>
        <Link to="/tree">
          <button
            type="button"
            id="landingButton"
            onClick={() => setActive("tree")}
          >
            View Tree
          </button>
        </Link>
        <div className="reset-button" onClick={() => props.resetName()}>
          Not You? Click to re-enter name
        </div>
      </div>
    </div>
  );
}

export default function LandingPage(props) {
  const resetName = () => {
    $("div.author-input").removeClass("hidden");
    $("div.landing-navigation").addClass("hidden");
    $("input.author-input").val("");
    $("ul.header-navigation").addClass("hidden");
  };

  $("ul.header-navigation").addClass("hidden");

  return (
    <div className="wrapper">
      <section className="content-container">
        <div className="header">
          <h1>Lay Family Tree</h1>
          <LandingNavigation resetName={resetName} />
        </div>
      </section>
    </div>
  );
}
