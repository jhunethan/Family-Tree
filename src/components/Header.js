import React from "react";
import "../css/Header.css";

export default function Header(props) {
  setTimeout(() => {
      const [burger, cross] = document.querySelectorAll("i");
  const target = document.querySelector(".nav-ul");
  
  burger.addEventListener("click", () => {
    target.classList.toggle("visible");
  });
  
  cross.addEventListener("click", () => {
    target.classList.toggle("visible");
  });
  }, 1000);


  return (
    <nav>
      <div class="asidecontainer">
            <i class="fas fa-bars">☰</i>

        <a href="/" class="nav-logo">
          LOGO
        </a>
        <ul class="nav-ul">
          <li>
            <button type="button" class="nav-link" onClick={()=>{props.option1action()}}>
              {props.option1text}
            </button>
          </li>
          <li>
          <button type="button" class="nav-link" onClick={()=>{props.option2action()}}>
              {props.option2text}
            </button>
          </li>
          <li>
          <button type="button" class="nav-link" onClick={()=>{props.option3action()}}>
              {props.option3text}
            </button>
          </li>
          <li>
          <button type="button" class="nav-link" onClick={()=>{props.option4action()}}>
              {props.option4text}
            </button>
          </li>
          <i class="far fa-times-circle">㊂</i>
        </ul>
      </div>
    </nav>
  );
}
