import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Axios from "axios";

export default function Tree() {
  const [update, setUpdate] = useState(false);
  const [tableData, setTableData] = useState();
  var treeData = [];

  useEffect(() => {
    Axios.get("http://localhost:5000/api/get").then((result) => {
      setTableData(result.data);
    });
  }, [update]);

  //triggers a data request
  const updateTree = () => {
    setUpdate((prevUpdate) => !prevUpdate);
  };

  //convert to hierarchal tree form using d3.stratify()
  const converttreeData = () => {
    treeData = tableData;
    treeData = d3
      .stratify()
      .id((d) => d["id"])
      .parentId((d) => d["parentId"])(treeData);
  };

  return <div></div>;
}
