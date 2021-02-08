import React, { useState, useEffect } from "react";
import "../css/LandingPage.css";
import { Link } from "react-router-dom";
import Axios from "axios";
import * as $ from "jquery";
import { useCookies } from "react-cookie";

function Edits(props) {
  let changes = [];

  try {
    if (props.data.changes.includes(",")) {
      changes = props.data.changes.split(",");
    } else {
      changes[0] = props.data.changes;
    }
  } catch {
    changes[0] = props.data.changes;
  }
  if (props.data.method === "delete")
    changes[0] = `deleted node with ID ${props.data.id}`;
  return (
    <ul>
      {changes.map((n, index) => {
        return (
          <li className="history-edits" key={index}>
            {n}
          </li>
        );
      })}
    </ul>
  );
}

function EditHistory(props) {
  var dateFormat = require("dateformat");

  let count = 0;
  let slicesize = [props.pagesize * 10, (props.pagesize + 1) * 10];
  return (
    <div className="edit-history">
      {props.editHistory.slice(slicesize[0], slicesize[1]).map((x) => {
        let id = x.id !== 0 ? x.id : x.changes;
        count += 1;
        return (
          <div className="history-container" key={count}>
            <p>{dateFormat(x.time, "dS mmmm [HH:MM]")}</p>
            <p>
              <strong>{x.author}</strong> made the following changes to node{" "}
              {id}
            </p>
            <Edits data={x} />
          </div>
        );
      })}
    </div>
  );
}

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
  const [update, setupdate] = useState(0);
  const [editHistory, setEditHistory] = useState([]);
  const [databasesize, setDatabasesize] = useState(0);
  const [page, setPage] = useState(0);

  const updatehistory = () => {
    setupdate((prev) => prev + 1);
  };

  const changePage = (operator) => {
    if (page >= 0) {
      if (operator === "+") {
        if (page < editHistory.length / 10 - 1) setPage((prev) => prev + 1);
      } else {
        if (page !== 0) setPage((prev) => prev - 1);
      }
    }
  };

  useEffect(() => {
    Axios.get("http://localhost:5000/api/get/edithistory").then((result) => {
      setEditHistory(result.data.reverse());
    });
    Axios.get("http://localhost:5000/api/get").then((result) => {
      setDatabasesize(result.data.length);
    });
  }, [update]);

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
          <h1>Lay Family Database</h1>
          <LandingNavigation resetName={resetName} />
        </div>
        <h1 className="about-header">Edit History</h1>
        <section className="about-section">
          <div className="stats-container">
            <div className="stat-card users">
              <button onClick={updatehistory}>⟳</button>
              <h1>Total Users?</h1>
            </div>
            <div className="stat-card members">
              <h1>Family Members in Database</h1>
              <h2 className="edit-freq-display">{databasesize}</h2>
            </div>
            <div className="stat-card edits-freq">
              <h1>Edits this month</h1>
              <h2 className="edit-freq-display">{editHistory.length}</h2>
            </div>
          </div>
          <div>
            <h1 className="center">Edit History (Last 30 Days)</h1>
            <div className="page-container">
              <button onClick={() => changePage("-")}>Previous</button>
              <div className="page-number">Page {page + 1}</div>
              <button onClick={() => changePage("+")}>Next</button>
            </div>
          </div>

          <EditHistory editHistory={editHistory} pagesize={page} />
        </section>
      </section>
    </div>
  );
}
