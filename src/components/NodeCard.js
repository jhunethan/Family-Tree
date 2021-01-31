import React, { useState } from "react";
import * as $ from "jquery";

import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";

function NodeCardDetails(props) {
  switch (props.method) {
    case "generation":
      if (props.data.generation !== "") {
        return (
          <section>
            <h2>Generation</h2>
            <p>{props.data.generation}</p>
          </section>
        );
      } else {
        return <p></p>;
      }
    case "location":
      try {
        console.log(props.data.extradetails);
        if (props.data.extradetails.location !== "") {
          return (
            <section>
              <h2>Current location</h2>
              <p>{props.data.extradetails.location}</p>
            </section>
          );
        }
      } catch {
        return <p></p>;
      }
      break;
    case "extranames":
      try {
        return (
          <section>
            <h2>Additional Names</h2>
            <p>{props.data.extradetails.extranames}</p>
          </section>
        );
      } catch {
        return <p></p>;
      }
    case "fblink":
      try {
        if (
          props.data.extradetails.fblink.includes("https://www.facebook.com")
        ) {
          return (
            <section>
              <a className="fblink" href={props.data.extradetails.fblink}>
                Facebook Link
              </a>
            </section>
          );
        } else {
          return <p></p>;
        }
      } catch {
        return <p></p>;
      }
    case "description":
      try {
        if (props.data.extradetails.description !== "") {
          let output = props.data.extradetails.description.split("\n\n");
          return (
            <section>
              <h2>Description</h2>
              <div>
                {output.map((x) => {
                  return <p>{x}</p>;
                })}
              </div>
            </section>
          );
        }
      } catch {
        return <p></p>;
      }
      break;
    default:
      break;
  }
}

export default function NodeCard(props) {
  const [cardexpanded, setcardexpanded] = useState(false);

  const transform = () => {
    if (!cardexpanded) {
      $("div.card-main").css("width", "99%");
      $("#card-container").css("width", "99%");
      setcardexpanded(true);
    } else {
      $("div.card-main").css("width", 350);
      $("#card-container").css("width", 350);
      setcardexpanded(false);
    }
  };

  return (
    <div id="card-container">
      <div className="card-nav">
        {" "}
        <button
          id="card-close"
          onClick={() => {
            $("#card-container").css("display", "none");
          }}
        >
          X
        </button>
        <button id="card-expand" onClick={transform}>
          ⤡
        </button>
        <button id="card-edit" onClick={props.edit}>
          Edit
        </button>
      </div>
      <div className="card-main">
        <section className="top-card">
          <img src={placeholder} alt="user" />
        </section>
        <section className="middle-card">
          <h1>
            {props.data.generation} {props.data.name}
          </h1>
          <div className="card-content">
            <div className="card-details">
              <NodeCardDetails data={props.data} method="generation" />
              <NodeCardDetails data={props.data} method="location" />
              <NodeCardDetails data={props.data} method="extranames" />
              <NodeCardDetails data={props.data} method="fblink" />
            </div>
            <div className="card-description">
              <NodeCardDetails data={props.data} method="description" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
