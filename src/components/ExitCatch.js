import React from "react";
import "../css/ExitCatch.css";

export default function ExitCatch(props) {
  return (
    <div
      id="exitCatch"
      onClick={() => {
        try {
          props.close();
          document.getElementById("exitCatch").style.display = "none";
        } catch {}
      }}
    ></div>
  );
}
