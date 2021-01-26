import React from "react";
import "../css/Header.css";

export default function Header(props) {
  return (
    <nav>
      <div className="asidecontainer">
        <i
          className="fas fa-bars"
          onClick={() => {
            document.querySelector(".nav-ul").classList.toggle("visible");
          }}
        >
          ☰
        </i>

        <a href="/" className="nav-logo">
          LOGO
        </a>
        <ul className="nav-ul">
          <li>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                props.option1action();
              }}
            >
              {props.option1text}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                props.option2action();
              }}
            >
              {props.option2text}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                props.option3action();
              }}
            >
              {props.option3text}
            </button>
          </li>
          <li>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                props.option4action();
              }}
            >
              {props.option4text}
            </button>
          </li>
          <i
            className="far fa-times-circle"
            onClick={() => {
              document.querySelector(".nav-ul").classList.toggle("visible");
            }}
          >
            ㊂
          </i>
        </ul>
      </div>
    </nav>
  );
}
