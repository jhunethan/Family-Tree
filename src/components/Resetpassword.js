import Axios from "axios";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "../css/Resetpassword.css";

export default function Resetpassword() {
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState();
  var history = useHistory();
  var token = window.location.href.split("token=").slice(-1);

  const resetPass = () => {
    try {
      let password = document.getElementById("password-input").value;
      let url = `http://localhost:5000/api/resetpass/success`;

      console.log(token);
      if (token.includes("/reset-password/")) return;

      Axios.post(url, { email: email, password: password }).then((result) => {
        console.log(result);
        if (result.data === "password changed") history.push("/tree");
      });
    } catch (error) {
      console.log(error);
    }
  };

  Axios.post("http://localhost:5000/api/resetpass", {
    token: token[0],
  }).then((result) => {
    if (result.data === "invalid token") return false;
    setValid(true);
    setEmail(result.data);
  });

  if (!valid) {
    return (
      <div className="Resetpassword-container">
        <h1 className="Resetpassword-Title">Lay Family Tree</h1>
        <h2 className="Resetpassword-subtitle">Reset Password Form</h2>
        <p>
          This Link is invalid. Please follow this button to request another
          link
        </p>
      </div>
    );
  } else {
    return (
      <div className="Resetpassword-container">
        <h1 className="Resetpassword-Title">Lay Family Tree</h1>
        <h2 className="Resetpassword-subtitle">Reset Password Form</h2>
        <h3>{email}</h3>
        <label className="Resetpassword-label">Enter a new password</label>
        <input
          type="password"
          className="Resetpassword-input"
          id="password-input"
        />
        <label className="Resetpassword-label">Repeat your new password</label>
        <input
          type="password"
          className="Resetpassword-input"
          id="password-input-2"
        />
        <button onClick={() => resetPass()} className="Resetpassword-button">
          Reset Password
        </button>
      </div>
    );
  }
}
