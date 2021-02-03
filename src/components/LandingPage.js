import React from "react";
import "../css/LandingPage.css";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="wrapper">
      <section className="content-container">
        <div className="header">
          <h1>Lay Family Database</h1>
          <p>Interactive visual representation</p>
          <Link to="/table">
            <button type="button" id="landingButton">
              View Table
            </button>
          </Link>
          <Link to="/tree">
            <button type="button" id="landingButton">
              View Tree
            </button>
          </Link>
        </div>
        <h1 className="about-header">Edit History</h1>
        <section className="about-section">
          <div className="stat-card users"></div>
          <div className="stat-card members"></div>
          <div className="edit-history"> </div>
        </section>
      </section>
    </div>
  );
}
