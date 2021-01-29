import React, { useState } from "react";
import * as $ from "jquery";

import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";

export default function NodeCard(props) {
  const [cardexpanded, setcardexpanded] = useState(false);

  const transform = () => {
    if (!cardexpanded) {
      $("#card-container").css("width", 600);
      $("#card-container").css("right", "calc(50% - 250px)");
      setcardexpanded(true);
    } else {
      $("#card-container").css("width", 350);
      $("#card-container").css("right", 10);
      setcardexpanded(false);
    }
  };

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
        <button id="card-expand" onClick={transform}>
          ⤡
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
