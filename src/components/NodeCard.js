import React from "react";
import "../css/NodeCard.css";
import placeholder from "../css/person-placeholder.jpg";

export default function NodeCard() {
  return (
    <div className="card-container">
      <section class="top-card">
        <img src={placeholder} alt="user" />
      </section>

      <section class="middle-card">
        <h1>Hau Jhun Ethan Lay</h1>
        <p>28th Dec 2001</p>
        <h2>Generation</h2><p>Hau</p>
        <h2>Current Location</h2>
        <p>United Kingdom</p>
      </section>

      <footer>
        <h1>Immediate Family</h1>
        <p>links to parents, siblings and children</p>
      </footer>
    </div>
  );
}
