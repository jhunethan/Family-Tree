import React, { useState, useEffect } from "react";
import "../css/LandingPage.css";
import { Link } from "react-router-dom";
import Axios from "axios";
import * as $ from "jquery";

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
  let count = 0;
  let slicesize = [props.pagesize * 25, (props.pagesize + 1) * 25];
  return (
    <div className="edit-history">
      {props.editHistory.slice(slicesize[0], slicesize[1]).map((x) => {
        let id = x.id !== 0 ? x.id : x.changes;
        count += 1;

        return (
          <div className="history-container" key={count}>
            <p>{x.time}</p>
            <p>
              {x.author} made the following changes to {id}
            </p>
            <Edits data={x} />
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
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
        if (page < editHistory.length / 25 - 1) setPage((prev) => prev + 1);
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

  const setauthor = () => {
    //use context to set author as state of App.js
    $("div.author-input").addClass("hidden");
    $("div.landing-navigation").removeClass("hidden");
  };

  return (
    <div className="wrapper">
      <section className="content-container">
        <div className="header">
          <h1>Lay Family Database</h1>

          <div className="author-input">
            <input
              type="text"
              placeholder="Enter your name here"
              className="author-input"
            />
            <button id="landingButton" onClick={()=>setauthor()}>
              Enter Name
            </button>
          </div>
          <div className="landing-navigation hidden">
            <p>Choose an option</p>
            <Link to="/table">
              <button type="button" id="landingButton">
                View Table
              </button>
            </Link>
            <Link to="/tree">
              <button type="button" id="landingButton">
                View Tree
              </button>
            </Link>
          </div>
        </div>
        <h1 className="about-header">Statistics</h1>
        <section className="about-section">
          <div className="stats-container">
            <div className="stat-card users">
              {" "}
              <button onClick={updatehistory}>⟳</button>
              <h1>Total Users?</h1>
            </div>
            <div className="stat-card members">
              {" "}
              <h1>Family Members in Database</h1>
              <h2 className="edit-freq-display">{databasesize}</h2>
            </div>
            <div className="stat-card edits-freq">
              <h1>Edits this month</h1>
              <h2 className="edit-freq-display">{editHistory.length}</h2>
            </div>
          </div>
          <div>
            <h1 className="center">Edit History</h1>
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
