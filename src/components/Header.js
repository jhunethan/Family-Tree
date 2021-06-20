import React from "react";
import { Link } from "react-router-dom";
import * as $ from "jquery";
import { useCookies } from "react-cookie";

import "../css/Header.css";
import layCharacter from "../css/layCharacter.png";

function AdminNav(props) {
  const [cookies] = useCookies();
  return cookies["lay-access"] === "admin" ? (
    <ul className="nav-ul header-navigation hidden">
      <Link
        to="/table"
        id="nav-link-one"
        className="nav-link"
        onClick={() => {
          props.toggleActive("table");
        }}
      >
        Table
      </Link>
      <Link
        to="/tree"
        id="nav-link-two"
        className="nav-link active"
        onClick={() => {
          props.toggleActive("tree");
        }}
      >
        Tree
      </Link>
    </ul>
  ) : null;
}

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
        <a href="/" className="nav-logo-container">
          <img src={layCharacter} alt="logo" className="nav-logo" />
        </a>
        <AdminNav toggleActive={toggleActive} />
      </div>
    </nav>
  );
}
