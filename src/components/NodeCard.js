import React from "react";
import * as $ from "jquery";

import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";

export default function NodeCard(props) {
  return (
    <div id="card-container">
      <section className="top-card">
        <button
          id="card-close"
          onClick={() => {
            $("#card-container").css("display", "none");
          }}
        >
          X
        </button>
        <button id="card-edit" onClick={props.edit}>
          Edit
        </button>
        <img src={placeholder} alt="user" />
      </section>

      <section className="middle-card">
        <h1>
          {props.InfoCardgeneration} {props.InfoCardname}
        </h1>
        <p>{props.InfoCardbirthdate}</p>
        <h2>Generation</h2>
        <p>{props.InfoCardgeneration}</p>
        <h2>Current Location</h2>
        <p>United Kingdom</p>
      </section>

      <footer>
        <h1>Immediate Family</h1>
        <p>links to parents, siblings and children</p>
      </footer>
    </div>
  );
}
