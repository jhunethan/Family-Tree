import React from "react";
import * as $ from "jquery";

export default function TreeSearch(props) {
  return (
    <div>
      <div className="datalist">
        <input
          id="datalist-input"
          className="input"
          type="text"
          name="searchtree"
          placeholder="Search by Name or Birthdate"
          list="datalist-ul"
          onChange={() => {
            props.filter();
          }}
          onClick={() => {
            props.filter();
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              // Cancel the default action, if needed
              event.preventDefault();
              // Focus on next element if successful
              let val = $("#datalist-input").val();
              if (props.search(val, "first")) event.target.blur();
            }
          }}
        />
        <button
          id="datalistbutton"
          onClick={(event) => {
            if (!props.search($("#datalist-input").val(), "first"))
              return document.getElementById("datalist-input").focus();
          }}
        >
          Search
        </button>
        <ul
          className="datalist-ul"
          onClick={(e) => {
            try {
              props.search(e.target.closest("li").textContent);
            } catch {}
          }}
        ></ul>
      </div>
    </div>
  );
}
