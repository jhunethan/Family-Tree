import React from "react";
import "../css/LandingPage.css";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="wrapper">
      <div className="Container">
        <div className="nav">
          <div className="logo">LOGO</div>
          <div className="menu">
            <ul className="navMenu">
              <li>
                <a href="/">Login</a>
              </li>
              <li>
                <a href="/">Register</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="header">
          <h1>Lay Family Tree</h1>
          <p>Interactive visual representation</p>
          <Link to="/table">
            <button type="button" id="landingButton">View Table</button>
          </Link>
          <Link to="/tree">
            <button type="button" id="landingButton">View Tree</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
