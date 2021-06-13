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
              event.preventDefault();
              let id = $("#treeSearch-datalist-ul")[0].firstChild.dataset.id;
              if (props.search(id)) event.target.blur();
            }
          }}
        />
        <button
          id="datalistbutton"
          onClick={(event) => {
            let id = $("#treeSearch-datalist-ul")[0].firstChild.dataset.id;
            if (!props.search(id))
              return document.getElementById("datalist-input").focus();
          }}
        >
          Search
        </button>
        <ul
          className="datalist-ul"
          id="treeSearch-datalist-ul"
          onClick={(e) => {
            try {
              props.search(e.target.closest("li").dataset.id);
            } catch (err) {console.log(err)}
          }}
        ></ul>
      </div>
    </div>
  );
}
