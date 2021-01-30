import React, { useState } from "react";
import * as $ from "jquery";

import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";

export default function NodeCard(props) {
  const [cardexpanded, setcardexpanded] = useState(false);

  // const [extra, setextra] = useState({
  //   id: 0,
  //   location: "",
  //   extranames: "",
  //   fblink: "",
  //   description: "",
  // });

  // useEffect(() => {
  //   try {
    //     setextra(props.data.extradetails);
    //   } catch {}
  // }, [props.data]); 

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
        <p>{props.data.birthdate}</p>
        <h2>Generation</h2>
        <p>{props.data.generation}</p>
        <h2>Current Location</h2>
        <p></p>
      </section>

      <footer>
        <h1>Immediate Family</h1>
        <p>links to parents, siblings and children</p>
      </footer>
    </div>
  );
}
