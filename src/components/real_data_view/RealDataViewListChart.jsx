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
import { useEffect, useState, useRef } from "react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const RealDattViewListChart = ({ selectedTeam, selectedDate }) => {
  const [data, setData] = useState([]);
  const chartRef = useRef(null); 

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
        borderColor: "#4ade80", 
        backgroundColor: "#4ade80",
        tension: 0.3,
        yAxisID: "y",
      },
      {
        label: "Scheduled Agents",
        data: data.map((item) => item.scheduled_agents),
        fill: false,
        borderColor: "#20e3cd", 
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
        borderColor: "#ef4444", 
        backgroundColor: "#ef4444",
        tension: 0.3,
        yAxisID: "y1",
      },
      {
        label: "Forecast Received",
        data: data.map((item) => item.forecast_received),
        fill: false,
        borderColor: "#a855f7", 
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

  // // Función para descargar la gráfica como imagen
  // const handleDownload = () => {
  //   const chart = chartRef.current; // Obtener la referencia al gráfico directamente
  //   if (chart) {
  //     const imageUrl = chart.toBase64Image(); // Obtener la imagen en formato base64

  //     const link = document.createElement("a");
  //     link.href = imageUrl; // Establecer la URL de la imagen
  //     link.download = "grafica.png"; // Establecer el nombre del archivo a descargar
  //     link.click(); // Simular un clic para descargar la imagen
  //   }
  // };

  return (
    <div className="w-full flex justify-end">
      <div className="w-[100%] p-4 bg-white rounded">
        <h2 className="text-lg font-bold mb-4">Service Level Chart and Metrics</h2>

        <Line data={chartData} options={options} ref={chartRef} />
        {/* <button
          onClick={handleDownload}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Descargar Gráfica
        </button> */}
      </div>
    </div>
  );
};

export default RealDattViewListChart;
