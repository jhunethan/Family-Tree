import React from "react";
import "../css/Modal.css";

export default function Modal(props) {
  return (
    <div
      id="Modal"
      onClick={() => {
        try {
          props.close();
          document.getElementById("Modal").style.display = "none";
        } catch (err) {console.log(err)}
      }}
    ></div>
  );
}
