import React, { useState, useEffect } from "react";
import "../css/LandingPage.css";
import { Link } from "react-router-dom";
import Axios from "axios";

function EditHistory(props) {
  let count = 0;

  return (
    <div className="edit-history">
      {props.editHistory.reverse().map((x) => {
        let id = x.id !== 0 ? x.id : x.changes;
        count += 1;

        let changes;
        try {
          if (x.changes.include(",")) {
            changes = x.changes.split(",");
          } else {
            changes = x.changes;
          }
        } catch {
          changes = x.changes;
        }
        if(x.method === "delete") changes = `deleted node with ID ${x.id}`

        return (
          <div className="history-container" key={count}>
            <p>{x.time}</p>
            <p>
              {x.author} made the following changes to {id}
            </p>
            <div>{changes}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const [update, setupdate] = useState(0);
  const [editHistory, setEditHistory] = useState([]);

  const updatehistory = () => {
    setupdate((prev) => prev + 1);
  };

  useEffect(() => {
    Axios.get("http://localhost:5000/api/get/edithistory").then((result) => {
      setEditHistory(result.data);
    });
  }, [update]);

  return (
    <div className="wrapper">
      <section className="content-container">
        <div className="header">
          <h1>Lay Family Database</h1>
          <p>Interactive visual representation</p>
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
        <h1 className="about-header">Edit History</h1>
        <section className="about-section">
          <div className="stats-container">
            <div className="stat-card users">
              {" "}
              <button onClick={updatehistory}>⟳</button>
            </div>
            <div className="stat-card members"></div>
            <div className="stat-card edits-freq"></div>
          </div>

          <EditHistory editHistory={editHistory}> </EditHistory>
        </section>
      </section>
    </div>
  );
}
