import React, { useEffect, useState, useRef } from "react";
import RealDataViewList from "./RealDataViewList";
import RealDattViewListChart from "./RealDataViewListChart";
import RealDataViewListResumen from "./RealDataViewListResumen";
import Papa from "papaparse"; // Importamos PapaParse para exportar a CSV
import html2canvas from "html2canvas-pro"; // Importamos html2canvas-pro

const teams = ["CHAT CUSTOMER", "CHAT RIDER", "CALL VENDORS"];

const RealDataDashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [allData, setAllData] = useState([]); // Estado para almacenar todos los datos
  const sectionRef = useRef(null); // Referencia para la sección a capturar

  // Obtener fechas únicas y todos los datos desde la API
  useEffect(() => {
    fetch("https://gtr-glovoes-cxpe.onrender.com/real-data-view/")
      .then((res) => res.json())
      .then((data) => {
        const uniqueDates = [...new Set(data.map((item) => item.date))];
        uniqueDates.sort(); // opcional: ordena fechas
        setAvailableDates(uniqueDates);
        setSelectedDate(uniqueDates[0]); // por defecto, la primera
        setAllData(data); // Guardamos todos los datos en el estado
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Función para exportar todos los datos a CSV, omitiendo la columna 'id'
  const handleExportCSV = () => {
    const filteredData = allData.map(({ id, ...rest }) => rest); // Filtramos los datos y omitiendo el campo 'id'
    const csvData = Papa.unparse(filteredData);
    const link = document.createElement("a");
    const blob = new Blob([csvData], { type: "text/csv" });
    link.href = URL.createObjectURL(blob);
    link.download = "datos.csv";
    link.click(); // Simula un clic para descargar el CSV
  };

  // Función para capturar la sección y descargarla como imagen
  const handleCapture = () => {
    if (sectionRef.current) {
      html2canvas(sectionRef.current, {
        backgroundColor: "#FFC244", // Asegura un fondo blanco
        useCORS: true, // Para evitar problemas con fuentes o imágenes externas
        logging: true, // Habilitar logging para depurar problemas
      }).then((canvas) => {
        const imageURL = canvas.toDataURL(); // Convierte el canvas a imagen en base64

        const link = document.createElement("a");
        link.href = imageURL;
        link.download = "dashboard.png"; // Nombre del archivo de la imagen
        link.click(); // Simula un clic para descargar la imagen
      });
    }
  };

  return (
    <div>
      <div className="flex gap-4 items-center">
        <div className="p-2">
          <label htmlFor="team-select" className="mr-2 font-semibold text-sm">
            Select Team:
          </label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <div className="p-2">
          <label htmlFor="date-select" className="mr-2 font-semibold text-sm">
            Select Date:
          </label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div className="p-2">
          <label htmlFor="date-select" className="mr-2 font-semibold text-sm">
            Update Data:
          </label>
          <a className="border rounded px-2 py-1" href="https://gtr-cx-glovo-es.netlify.app/real-data-view/form">Go to Form</a>
        </div>

        {/* Botón para exportar los datos a CSV */}
        <div className="p-2">
          <button
            onClick={handleExportCSV}
            className="bg-[#00A082] text-white p-2 rounded"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {/* Referencia para la sección a capturar */}
      <div >
        <RealDataViewList selectedTeam={selectedTeam} selectedDate={selectedDate} />
        <div ref={sectionRef}>
          <div className="grid grid-cols-6" >
            <div className="col-span-1">
              <RealDataViewListResumen selectedTeam={selectedTeam} selectedDate={selectedDate} />
            </div>
            <div className="col-span-5">
              <RealDattViewListChart selectedTeam={selectedTeam} selectedDate={selectedDate} />
            </div>
          </div>
        </div>
        {/* Botón para descargar la imagen */}
        <div className="p-4 text-center">
          <button
            onClick={handleCapture}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Download Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealDataDashboard;
