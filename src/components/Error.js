import React from "react";
import "../css/Error.css";
import { Link } from "react-router-dom";

export default function Error() {
  return (
    <div id="oopss">
      <img
        src="https://cdn.rawgit.com/ahmedhosna95/upload/1731955f/sad404.svg"
        alt="404"
      />
      <div id="error-text">
        <span>Error 404</span>
        <p> Page Not Found</p>
        <Link exact to="/">
          <button id="back" type="button">
            Return To Homepage
          </button>
        </Link>
      </div>
    </div>
  );
}
