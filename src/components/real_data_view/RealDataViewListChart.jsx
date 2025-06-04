import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const RealDattViewListChart = ({ selectedTeam, selectedDate }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://gtr-glovoes-cxpe.onrender.com/real-data-view/")
      .then((res) => res.json())
      .then((json) => {
        const filtered = json
          .filter((item) => item.team === selectedTeam && item.date === selectedDate)
          .sort((a, b) => a.time_interval.localeCompare(b.time_interval));
        setData(filtered);
      });
  }, [selectedTeam, selectedDate]);

  const chartData = {
    labels: data.map((item) => item.time_interval),
    datasets: [
      {
        label: "Service Level (%)",
        data: data.map((item) => item.service_level),
        fill: false,
        borderColor: "#4ade80", // verde
        backgroundColor: "#4ade80",
        tension: 0.3,
        yAxisID: "y",
      },
      {
        label: "Scheduled Agents",
        data: data.map((item) => item.scheduled_agents),
        fill: false,
        borderColor: "#20e3cd", // azul
        backgroundColor: "#20e3cd",
        tension: 0.3,
        yAxisID: "y1",
      },
      {
        label: "Agents Online",
        data: data.map((item) => item.agents_online),
        fill: false,
        borderColor: "#78d12f", 
        backgroundColor: "#78d12f",
        tension: 0.3,
        yAxisID: "y1",
      },
      {
        label: "Real Received",
        data: data.map((item) => item.real_received),
        fill: false,
        borderColor: "#ef4444", // rojo
        backgroundColor: "#ef4444",
        tension: 0.3,
        yAxisID: "y1",
      },
      {
        label: "Forecast Received",
        data: data.map((item) => item.forecast_received),
        fill: false,
        borderColor: "#a855f7", // morado
        backgroundColor: "#a855f7",
        tension: 0.3,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        position: "left",
        min: 0,
        max: 105,
        ticks: {
          callback: (value) => value + "%",
        },
        title: {
          display: true,
          text: "Service Level (%)",
        },
      },
      y1: {
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Agentes y Volumen",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return label.includes("Service Level") ? `${label}: ${value}%` : `${label}: ${value}`;
          },
        },
      },
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="w-full flex justify-end">
      <div className="w-[100%] p-4 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-4">Service Level Chart and Metrics</h2>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RealDattViewListChart;
