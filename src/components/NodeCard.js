import React, { useState } from "react";
import * as $ from "jquery";

import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";

function NodeCardDetails(props) {
  switch (props.method) {
    case "generation":
      if (props.node.generation !== "") {
        return (
          <section>
            <h2>Generation</h2>
            <p>{props.node.generation}</p>
          </section>
        );
      } else {
        return <p></p>;
      }
    case "location":
      try {
        if (props.node.extradetails.location !== "") {
          return (
            <section>
              <h2>Current location</h2>
              <p>{props.node.extradetails.location}</p>
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
            <p>{props.node.extradetails.extranames}</p>
          </section>
        );
      } catch {
        return <p></p>;
      }
    case "fblink":
      try {
        if (
          props.node.extradetails.fblink.includes("https://www.facebook.com")
        ) {
          return (
            <section>
              <a className="fblink" href={props.node.extradetails.fblink}>
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
        if (props.node.extradetails.description !== "") {
          let output = props.node.extradetails.description.split("\n\n");
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

// function ImmediateFamily(props) {

//   switch (props.method) {
//     case "parents":
//       if (props.node.parent !== "") {
//         return (
//           <p>
//             <h2>Parents</h2>
//             <p1>{props.node.parent}</p1>
//           </p>
//         );
//       }
//       break;

//     default:
//       return <p></p>;
//   }
// }

export default function NodeCard(props) {
  const [cardexpanded, setcardexpanded] = useState(false);

  const transform = () => {
    if (!cardexpanded) {
      $("div.card-main").css("width", "100%");
      $("#card-container").css("width", "100%");
      $("#card-container").css("margin-left", "0px");
      setcardexpanded(true);
    } else {
      $("div.card-main").css("width", 350);
      $("#card-container").css("width", 350);
      $("#card-container").css("margin-left", "10px");
      setcardexpanded(false);
    }
  };

  return (
    <div id="card-container">
      <div className="card-nav">
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
            {props.node.generation} {props.node.name}
          </h1>
          <div className="card-content">
            <div className="card-details">
              <p1>{props.node.birthdate}</p1>
              <NodeCardDetails node={props.node} method="generation" />
              <NodeCardDetails node={props.node} method="location" />
              <NodeCardDetails node={props.node} method="extranames" />
              <NodeCardDetails node={props.node} method="fblink" />
            </div>
            <div className="card-description">
              <NodeCardDetails node={props.node} method="description" />
            </div>
          </div>
        </section>
        <footer>
          <h1>Immediate Family Members</h1>
          {/* <ImmediateFamily
            node={props.node}
            data={props.data}
            method="parents"
          /> */}
        </footer>
      </div>
    </div>
  );
}
