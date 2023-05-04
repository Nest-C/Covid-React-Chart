import React, { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import './App.css';
import { Chart as ChartJS, BarElement, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

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
      let newData = {
        country: data.province ? data.country + ' ' + data.province : data.country, 
        cases: data.timeline.cases, 
        backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`
      };
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
      setDateLoop(dateLoop === 27 ? 0 : dateLoop + 1)
      const chartData = getChartData(inintialDatas);
      setChartData(chartData);
    }, 500);
  }, [dateLoop, inintialDatas])


  const getChartData = (data) => {
    const labels = data.map((d) => ({
      label: d.country,
      data: Object.values(d.cases)[dateLoop],
      backgroundColor: d.backgroundColor,
    })).sort((a, b) => b.data - a.data).slice(0, 10);

    const chartData = {
      labels: labels.map(d => d.label),
      datasets: [{
        data: labels.map(a => a.data),
        backgroundColor: labels.map((d) => d.backgroundColor),
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
      aspectRatio: 3,
      plugins: {
        legend: {
          position: "none",
        },
        tooltip: {
          mode: 'index',
          enabled: true,
          external: (context) => {
            const label = context.chart.data.labels[context.dataIndex];
            const value = context.chart.data.datasets[0].data[context.dataIndex];
            console.log(context.chart.data.labels)
            console.log(context.chart.data.datasets)
            return `${label}: ${value}`;
          },
        },
        labels: {
          render: ({ label, value }) => {
            return `${label}: ${value}`;
          },
          font: {
            size: 12,
          },
          color: "black",
          position: "inside",
          align: "center",
          anchor: "end",
          offset: 0,
          padding: 0,
        },
      },
      scales: {
        x: {
          display: true,
          min: 0,
          max: 105000000,
          grid: {
            display: false,
          },
        },
        y: {
          display: true,
          grid: {
            display: false,
          },
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
              <p>Date : {dateLoop + 1}/02/2023</p>
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