import React, { useState, useEffect } from "react";
import * as $ from "jquery";

import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";

function NodeCardDetails(props) {
  switch (props.method) {
    case "generation":
      return (
        <section>
          <h2>Generation</h2>
          <p>{props.data.generation}</p>
        </section>
      );
    case "location":
      try {
        console.log(props.data)
        return (
          <section>
            <h2>Current location</h2>
            <p>{props.data.extradetails.location}</p>
          </section>
        );
      } catch {
        return <p></p>;
      }
    default:
      break;
  }
}

export default function NodeCard(props) {
  const [cardexpanded, setcardexpanded] = useState(false);

  const [extra, setextra] = useState({
    id: 0,
    location: "",
    extranames: "",
    fblink: "",
    description: "",
  });

  useEffect(() => {
    try {
      setextra(props.data.extradetails);
    } catch {}
  }, [props.data]);

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
          {props.data.generation} {props.data.name}
        </h1>
        <NodeCardDetails data={props.data} method="generation" />
        <NodeCardDetails data={props.data} method="location" />
      </section>

      <footer>
        <h1>Immediate Family</h1>
        <p>links to parents, siblings and children</p>
      </footer>
    </div>
  );
}
