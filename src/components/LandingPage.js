import React from "react";
import "../css/LandingPage.css";
import { Link } from "react-router-dom";
import image from "../css/linh-tran-VIvGPBm6uxg-unsplash.jpg";

export default function LandingPage() {
  return (
    <div className="wrapper">
      <div className="image-container">
        <img src={image} alt="landing-background" />
      </div>
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
        <section className="about-section">
          <p>ᐯ</p>
        </section>
      </section>
    </div>
  );
}
