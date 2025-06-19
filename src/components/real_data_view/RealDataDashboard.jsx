import React, { useEffect, useState, useRef } from "react";
import RealDataViewList from "./RealDataViewList";
import RealDattViewListChart from "./RealDataViewListChart";
import RealDataViewListResumen from "./RealDataViewListResumen";
import Papa from "papaparse"; 
import html2canvas from "html2canvas-pro"; 

const teams = ["CHAT CUSTOMER", "CHAT RIDER", "CALL VENDORS"];

const RealDataDashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [allData, setAllData] = useState([]); 
  const sectionRef = useRef(null); 


  useEffect(() => {
    fetch(`${import.meta.env.PUBLIC_URL_BACKEND}operational-view/`)
      .then((res) => res.json())
      .then((data) => {
        const uniqueDates = [...new Set(data.map((item) => item.date))];
        uniqueDates.sort(); 
        setAvailableDates(uniqueDates);
        setSelectedDate(uniqueDates[0]);
        setAllData(data); 
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Función para exportar todos los datos a CSV, omitiendo la columna 'id'
  const handleExportCSV = () => {
    const filteredData = allData.map(({ id, ...rest }) => rest); 
    const csvData = Papa.unparse(filteredData);
    const link = document.createElement("a");
    const blob = new Blob([csvData], { type: "text/csv" });
    link.href = URL.createObjectURL(blob);
    link.download = "datos.csv";
    link.click();
  };

  // Función para capturar la sección y descargarla como imagen
  const handleCapture = () => {
    if (sectionRef.current) {
      html2canvas(sectionRef.current, {
        backgroundColor: "#FFC244",
        useCORS: true, 
        logging: true, 
      }).then((canvas) => {
        const imageURL = canvas.toDataURL(); 

        const link = document.createElement("a");
        link.href = imageURL;
        link.download = "dashboard.png"; 
        link.click(); 
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
          <a className="border rounded px-2 py-1" href={`${import.meta.env.PUBLIC_URL_FRONTEND}real-data-view/form`}>Go to Form</a>
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
