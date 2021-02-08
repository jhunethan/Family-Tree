import React from "react";
import { Link } from "react-router-dom";
import * as $ from "jquery";

import "../css/Header.css";

export default function Header(props) {

  const toggleActive = (tab) => {
    if (!window.location.href.includes(tab)) {
      $("#nav-link-one").toggleClass("active");
      $("#nav-link-two").toggleClass("active");
    }
  };

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
          LAY
        </a>
        <ul className="nav-ul header-navigation hidden">
          <Link
            to="/table"
            id="nav-link-one"
            className="nav-link"
            onClick={() => {
              toggleActive("table");
            }}
          >
            Table
          </Link>
          <Link
            to="/tree"
            id="nav-link-two"
            className="nav-link active"
            onClick={() => {
              toggleActive("tree");
            }}
          >
            Tree
          </Link>
          <i
            className="far fa-times-circle"
            onClick={() => {
              document.querySelector(".nav-ul").classList.toggle("visible");
            }}
          >
            ☰
          </i>
        </ul>
      </div>
    </nav>
  );
}