import React, { useEffect, useState, useRef } from "react";
import { useSlaBreachedDataStore } from "./SlaBreachedDataStore";
import { useWorkersStore } from "../workers/store/WorkersStore";
import html2canvas from "html2canvas-pro";
import UploadSlaBreachedModal from "./UploadSlaBreachedModal";

export default function SlaBreachedTable() {
  const { slaBreachedData, fetchSlaBreachedData, loading: loadingSlaBreached } =
    useSlaBreachedDataStore();
  const { workers, fetchWorkers, loading: loadingWorkers } = useWorkersStore();

  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedIntervals, setSelectedIntervals] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortedData, setSortedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tableRef = useRef(null);

  const loading = loadingSlaBreached || loadingWorkers;

  useEffect(() => {
    fetchSlaBreachedData();
    fetchWorkers();
  }, []);

  // Unión de datasets
  const mergedData = slaBreachedData.map((s) => {
    const worker = workers.find((w) => w.api_email === s.api_email);
    const supervisor = worker?.supervisor || "-";
    const coordinator = worker?.coordinator || "-";
    const workerName = worker?.name || s.api_email;

    return {
      ...s,
      workerName,
      supervisor,
      coordinator,
    };
  });

  const teams = [
    "All",
    "Customer Tier1",
    "Customer Tier2",
    "Vendor Tier1",
    "Vendor Tier2",
    "Rider Tier1",
    "Rider Tier2",
  ];

  const dates = ["All", ...new Set(mergedData.map((d) => d.date))];

  const hours = Array.from(
    { length: 24 },
    (_, i) => String(i).padStart(2, "0") + ":00"
  );

  let filteredData = mergedData;

  if (selectedIntervals.length === 2) {
    const [start, end] = [...selectedIntervals].sort();
    const startIdx = hours.indexOf(start);
    const endIdx = hours.indexOf(end);
    const range = hours.slice(startIdx, endIdx + 1);

    filteredData = mergedData.filter(
      (row) =>
        (selectedTeam === "All" || row.team === selectedTeam) &&
        (selectedDate === "All" || row.date === selectedDate) &&
        range.includes(row.interval)
    );

    const existingIntervals = filteredData.map((d) => d.interval);
    const missingIntervals = range.filter((hr) => !existingIntervals.includes(hr));

    const placeholders = missingIntervals.map((hr) => ({
      team: selectedTeam === "All" ? "-" : selectedTeam,
      date: selectedDate === "All" ? "-" : selectedDate,
      interval: hr,
      chats_breached: 0,
    }));

    filteredData = [...filteredData, ...placeholders].sort(
      (a, b) => hours.indexOf(a.interval) - hours.indexOf(b.interval)
    );
  } else {
    filteredData = mergedData.filter((row) => {
      const matchTeam = selectedTeam === "All" || row.team === selectedTeam;
      const matchDate = selectedDate === "All" || row.date === selectedDate;
      const matchInterval =
        selectedIntervals.length === 0 ||
        selectedIntervals.includes(row.interval);
      return matchTeam && matchDate && matchInterval;
    });
  }

  const handleIntervalClick = (hour) => {
    setSelectedIntervals((prev) => {
      if (prev.includes(hour)) return prev.filter((h) => h !== hour);
      if (prev.length === 2) return [prev[1], hour];
      return [...prev, hour];
    });
  };

  const copyTableAsImage = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    canvas.toBlob((blob) => {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const calculateTotals = (data) => {
    const totalChats = data.reduce(
      (sum, d) => sum + (d.chat_breached || 0),
      0
    );
    return {
      team: "Totales",
      interval: "Total",
      chats_breached: totalChats,
    };
  };

  const totals = calculateTotals(filteredData);

  const handleCoordinatorSort = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    const sorted = [...filteredData].sort((a, b) => {
      if (newSortOrder === "asc") {
        return a.supervisor.localeCompare(b.supervisor);
      } else {
        return b.supervisor.localeCompare(a.supervisor);
      }
    });

    setSortedData(sorted);
  };

  useEffect(() => {
    const sorted = [...filteredData].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.supervisor.localeCompare(b.supervisor);
      } else {
        return b.supervisor.localeCompare(a.supervisor);
      }
    });
    setSortedData(sorted);
  }, [selectedTeam, selectedDate, selectedIntervals, sortOrder]);

  const dataToRender = sortedData.length > 0 ? sortedData : filteredData;

  // 🔥 AHORA QUE TODOS LOS HOOKS YA SE EJECUTARON, ES SEGURO RETORNAR
  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }


  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">SLA Breached Data</h2>

      {/* Filtros principales */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Equipo:</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="mt-1 border border-gray-300 rounded px-3 py-1 text-sm"
          >
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha:</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 border border-gray-300 rounded px-3 py-1 text-sm"
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            fetchSlaBreachedData(true);
          }}
          className="self-end px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          🔄 Actualizar datos
        </button>
      </div>

      {/* Filtros de hora */}
      <div className="flex flex-wrap gap-1 mb-4">
        {hours.map((hour) => (
          <button
            key={hour}
            onClick={() => handleIntervalClick(hour)}
            className={`px-3 py-1 text-xs rounded ${selectedIntervals.includes(hour) ? "border-2" : ""}`}
          >
            {hour}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div ref={tableRef} className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm text-sm">
          <thead className="bg-gray-100 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2">{selectedDate}</th>
              <th colSpan={4} className="px-4 py-2">{selectedTeam}</th>
            </tr>
            <tr className="*:text-center">
              <th className="px-4 py-2 text-left font-semibold">Agent</th>
              <th className="px-4 py-2 text-left font-semibold">Supervisor
                <button
                  onClick={handleCoordinatorSort}
                  className="ml-2 text-sm text-blue-500"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </th>
              <th className="px-4 py-2 text-left font-semibold">Coordinator  
              </th>
              <th className="px-4 py-2 text-left font-semibold">Interval</th>
              <th className="px-4 py-2 text-left font-semibold">Chats Breached</th>
            </tr>
          </thead>
          <tbody>
            {dataToRender.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-200 dark:bg-gray-700"
                } hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors *:text-center`}
              >
                <td className="px-4 py-2">{item.workerName}</td>
                <td className="px-4 py-2">{item.supervisor}</td>
                <td className="px-4 py-2">{item.coordinator}</td>
                <td className="px-4 py-2">{item.interval}</td>
                <td className="px-4 py-2">{item.chat_breached}</td>
              </tr>
            ))}

            {/* Fila de Totales */}
            <tr className="bg-green-200 dark:bg-green-800 *:text-center">
              <td colSpan={4} className="px-4 py-2 font-semibold">Totales</td>
              <td className="px-4 py-2 ">{totals.chats_breached}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Botones inferiores */}
      <div className="flex gap-3">
        <button
          onClick={copyTableAsImage}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm"
        >
          🖼️ Copiar tabla
        </button>
      </div>

      {/* Modal para subir datos */}
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm mt-4"
      >
        Subir Datos SLA Breached
      </button>
      <UploadSlaBreachedModal isOpen={isModalOpen} onClose={closeModal} onSuccess={fetchSlaBreachedData} />
    </div>
  );
}
