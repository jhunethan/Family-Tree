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
        <h1 className="about-header">Edit History</h1>
        <section className="about-section">
          <div className="stat-card users"></div>
          <div className="stat-card members"></div>
          <div className="edit-history">
            Reprehenderit nisi Lorem sint pariatur consequat enim ut enim culpa.
            Laboris exercitation proident nulla duis eiusmod do dolore est
            consequat non laborum. Minim consequat fugiat laboris id mollit qui
            mollit fugiat pariatur sint aliquip sint do qui. Mollit enim nostrud
            id nulla est. Elit fugiat ex Lorem aute occaecat dolore sint.
            Proident sit do proident duis nostrud. Mollit et veniam sint in.
          </div>
        </section>
      </section>
    </div>
  );
}
