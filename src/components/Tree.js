import React, { Fragment } from "react";
var data = [
  {
    name: "Root",
    children: [
      {
        name: "Child 1",
        children: [
          {
            name: "Grand Child",
          },
        ],
      },
      {
        name: "Child 2",
        children: [
          {
            name: "Grand Child",
            children: [
              {
                name: "Great Grand Child 1",
              },
              {
                name: "Grand Grand Child 2",
              },
            ],
          },
        ],
      },
      {
        name: "Child 2",
      },
    ],
  },
];
const Card = (props) => {
  const levelColor = "#fff";

  return (
    <ul>
      {props.data.map((item) => (
        <Fragment key={item.name}>
          <li>
            <div className="card">
              <div className="image">
                <img alt="Profile" style={{ borderColor: levelColor }} />
              </div>
              <div className="card-body">
                <h4></h4>
                <p></p>
              </div>
              <div className="card-footer" style={{ background: levelColor }}>
                <img
                  src="https://www.flaticon.com/svg/static/icons/svg/2950/2950657.svg"
                  alt="Chat"
                />
                <img
                  src="https://www.flaticon.com/svg/static/icons/svg/1034/1034131.svg"
                  alt="Call"
                />
                <img
                  src="https://www.flaticon.com/svg/static/icons/svg/570/570387.svg"
                  alt="Video"
                />
              </div>
              <div></div>
            </div>
            {item.children?.length && <Card data={item.children} />}
          </li>
        </Fragment>
      ))}
    </ul>
  );
};

const Chart = () => {
  return (
    <div className="org-tree">
      <Card data={data} />
    </div>
  );
};

export default Chart;

// import * as d3 from "d3";
// import Axios from "axios";

// const [update, setUpdate] = useState(false);
// const [tableData, setTableData] = useState();
// var treeData = [];

// useEffect(() => {
//   Axios.get("https://lay-family-tree.herokuapp.com/api/get").then(
//     (result) => {
//       setTableData(result.data);
//     }
//   );
// }, [update]);

// //triggers a data request
// const updateTree = () => {
//   setUpdate((prevUpdate) => !prevUpdate);
// };

// //convert to hierarchal tree form using d3.stratify()
// const converttreeData = () => {
//   treeData = tableData;
//   treeData = d3
//     .stratify()
//     .id((d) => d["id"])
//     .parentId((d) => d["parentId"])(treeData);
// };
