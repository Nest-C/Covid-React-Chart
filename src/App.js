import React, { useState, useEffect, useRef } from "react";
import  { Bar } from "react-chartjs-2";
import './App.css';
import 'chart.js/auto';

const CovidData = () => {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateLoop, setDateLoop] = useState(0);
  const [inintialDatas, setInintialDatas] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "https://disease.sh/v3/covid-19/historical?lastdays=37"
      );
      const data = await response.json();

      inintialData(data);
      const sortedData = inintialData(data);
      getChartData(sortedData);
      const chartData = getChartData(sortedData);
        
      setLoading(false)
      setChartData(chartData);
      setChartOptions(getChartOptions());
    };
    fetchData();
  }, []);
  
  const inintialData = (data) => {
    let datas = [];

    datas = data.map(data => {
      let newData = {country: data.province ? data.country + ' ' + data.province : data.country, cases: data.timeline.cases};
      for (const key in newData.cases) {
        if (key.startsWith("3/")) {
          delete newData.cases[key];
        }
      }
      return newData
    })
    setInintialDatas(datas)
    return datas
  };

 useEffect(() => {
  setTimeout(() => {
    setDateLoop(dateLoop === 27 ? 0 : dateLoop + 1 )
    const chartData = getChartData(inintialDatas);
    setChartData(chartData);
  }, 500);
 }, [dateLoop, inintialDatas])


  const getChartData = (data) => {
    const label = data.map(d => ({label: d.country, data: Object.values(d.cases)[dateLoop]})).sort((a, b) => b.data - a.data).slice(0,17)
    const chartData = {
      labels: label.map(d => d.label),
      datasets:[{
        label: '-',
        data: label.map(a => a.data),
        backgroundColor: ['#060047', '#B3005E', '#E90064']
      }]
    };
    return chartData;
  };

  const getChartOptions = () => {
    const chartOptions = {
      indexAxis: "y",
      elements: {
        bar: {
          borderWidth: 1,
        },
      },
      responsive: true,
      aspectRatio: 4,
      plugins: {
        legend: {
          position: "none",
        },
        customCanvasBackgroundColor: {
          color: 'write',
        },
      },
    };
    return chartOptions;
  };

  return (
    <div>
      {loading || !chartData ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div className="header">
            <div className="headerContent">
              <h1>
                Covid Global Cases by SGN
              </h1>
              <p>Date : {dateLoop+1}/02/2023</p>
            </div>
           </div>
           <div className="containerChart">
            <Bar data={chartData} options={chartOptions} ref={chartRef} />
           </div>
        </div>
      )}
    </div>
  );
};

export default CovidData;