import React from "react";
import "../../css/GlobalFilter.css";

export const GlobalFilter = ({ filter, setFilter }) => {
  return (
    <span id="search">
      <input
        id="searchInput"
        value={filter || ""}
        placeholder="Search"
        onChange={(e) => setFilter(e.target.value)}
      />
    </span>
  );
};

export default GlobalFilter;
