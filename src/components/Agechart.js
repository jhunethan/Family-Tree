import React, { useEffect, useState } from "react";
import LineChart from "react-linechart";

export default function Agechart(props) {
  var [data, setData] = useState([]);
  useEffect(() => {
    try {
      let coordinates = [{ x: 0, y: 0 }];
      let dbdata = props.data;
      for (let i = 0; i < dbdata.length; i++) {
        let duplicate = false;
        for (const x of coordinates) {
          if (Number(dbdata[i].birthdate.slice(0, 4)) === x.x) {
            x.y += 1;
            duplicate = true;
          }
        }
        if (!duplicate && Number(dbdata[i].birthdate.slice(0, 4)) < 2300)
          coordinates.push({
            x: Number(dbdata[i].birthdate.slice(0, 4)),
            y: 1,
          });
      }
      let res = coordinates.filter((x) => x.x !== 0);
      res = res.sort((a, b) => b.x - a.x);
      setData([{ color: "steelblue", name: "Age Frequency", points: res }]);
    } catch {}
  }, [props.data]);

  return (
      <div className="Linechart">
        <LineChart
          interpolate="cardinal"
          hideYAxis={true}
          xLabel="Year"
          data={data}
          yMin="0"
          width={750}
          height={400}
        />
      </div>
  );
}
