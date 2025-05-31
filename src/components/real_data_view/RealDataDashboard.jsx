import React, { useEffect, useState } from "react";
import RealDataViewList from "./RealDataViewList";
import RealDattViewListChart from "./RealDataViewListChart";
import RealDataViewListResumen from "./RealDataViewListResumen";

const teams = ["CHAT CUSTOMER", "CHAT RIDER", "CALL VENDORS"];

const RealDataDashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);

  // Obtener fechas únicas desde la API
  useEffect(() => {
    fetch("https://gtr-glovoes-cxpe.onrender.com/real-data-view/")
      .then((res) => res.json())
      .then((data) => {
        const uniqueDates = [...new Set(data.map((item) => item.date))];
        uniqueDates.sort(); // opcional: ordena fechas
        setAvailableDates(uniqueDates);
        setSelectedDate(uniqueDates[0]); // por defecto, la primera
      })
      .catch((error) => {
        console.error("Error fetching dates:", error);
      });
  }, []);

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
          <a href="real-data-view/form">Go to Form</a>
        </div>
      </div>

      <RealDataViewList selectedTeam={selectedTeam} selectedDate={selectedDate} />
      <div className="grid grid-cols-6">
        <div className="col-span-1">
          <RealDataViewListResumen selectedTeam={selectedTeam} selectedDate={selectedDate} />
        </div>
        <div className="col-span-5">
          <RealDattViewListChart selectedTeam={selectedTeam} selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
};

export default RealDataDashboard;
