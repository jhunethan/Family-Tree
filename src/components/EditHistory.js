import React, { useState, useEffect } from "react";
import Axios from "axios";
import * as $ from "jquery";
import "../css/EditHistory.css";

export function Edits(props) {
  let changes = [];

  try {
    if (props.data.changes.includes(",")) {
      changes = props.data.changes.split(",");
    } else {
      changes[0] = props.data.changes;
    }
  } catch (err) {
    changes[0] = props.data.changes;
  }
  if (props.data.method === "delete") changes[0] = `deleted ${props.data.name}`;
  if (props.data.method === "create") changes[0] = `added ${props.data.name}`;
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

export default function EditHistory(props) {
  const [page, setPage] = useState(0);
  const [update, setupdate] = useState(0);
  const [editHistory, setEditHistory] = useState([]);
  const [databasesize, setDatabasesize] = useState(0);
  var dateFormat = require("dateformat");
  let pagesize = 15,
    count = 0,
    slicesize = [page * pagesize, (page + 1) * pagesize];

  const updatehistory = () => {
    setupdate((prev) => prev + 1);
  };

  const close = () => {
    $(".edit-history").css("right", "-500px");
  }

  useEffect(() => {
    Axios.get("https://layfamily.herokuapp.com/api/get/edithistory").then((result) => {
      setEditHistory(result.data.reverse());
    });
    Axios.get("https://layfamily.herokuapp.com/api/get").then((result) => {
      setDatabasesize(result.data.length);
      // setData(result.data);
    });
  }, [update]);

  const changePage = (operator) => {
    if (page >= 0) {
      if (operator === "+") {
        if (page < editHistory.length / pagesize - 1)
          setPage((prev) => prev + 1);
      } else {
        if (page !== 0) setPage((prev) => prev - 1);
      }
    }
  };

  return (
    <div className="edit-history">
      <div className="stats-container">
        <div className="stat-card stat-buttons">
          <button className="stat-button" onClick={updatehistory}>
            ⟳
          </button>
          <button className="stat-button" onClick={()=>close()}>
            X
          </button>
        </div>
        <div className="stat-card members">
          <h1>Family Members</h1>
          <h2 className="edit-freq-display">{databasesize}</h2>
        </div>
        <div className="stat-card edits-freq">
          <h1>Edits (14 days)</h1>
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
      {editHistory.slice(slicesize[0], slicesize[1]).map((x) => {
        let name = x.id !== 0 ? x.name : x.changes;
        count += 1;
        return (
          <div className="history-container" key={count}>
            <p>{dateFormat(x.time, "dS mmmm [HH:MM]")}</p>
            <p>
              <strong>{x.author}</strong> made the following changes to {name}
            </p>
            <Edits data={x} />
          </div>
        );
      })}
    </div>
  );
}
