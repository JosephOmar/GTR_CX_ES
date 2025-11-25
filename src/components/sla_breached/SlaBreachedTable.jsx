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
    const links = s.link ? s.link.join("\n") : "";

    return {
      ...s,
      workerName,
      supervisor,
      coordinator,
      links, // Añadimos el atributo de los links
    };
  });

  const teams = [
    "All",
    "Customer Tier1",
    "Vendor Tier1",
    "Rider Tier1",
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

  const handleCopyTableToClipboard = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          const item = new ClipboardItem({
            "image/png": blob,
          });
          navigator.clipboard.write([item]);
        });
      });
    }
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

  // Cambié la función handleCoordinatorSort para ordenar por supervisor y luego coordinator
  const handleCoordinatorSort = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    const sorted = [...filteredData].sort((a, b) => {
        const supervisorA = a.supervisor || ""; // Protege contra undefined
        const supervisorB = b.supervisor || "";
        const coordinatorA = a.coordinator || ""; // Protege contra undefined
        const coordinatorB = b.coordinator || "";

        // Primero ordena por coordinator
        if (coordinatorA !== coordinatorB) {
        return newSortOrder === "asc"
            ? coordinatorA.localeCompare(coordinatorB)
            : coordinatorB.localeCompare(coordinatorA);
        }

        // Si los coordinadores son iguales, ordena por supervisor
        return newSortOrder === "asc"
        ? supervisorA.localeCompare(supervisorB)
        : supervisorB.localeCompare(supervisorA);
    });

    setSortedData(sorted);
  };

  useEffect(() => {
    const sorted = [...filteredData].sort((a, b) => {
        const supervisorA = a.supervisor || ""; // Protege contra undefined
        const supervisorB = b.supervisor || "";
        const coordinatorA = a.coordinator || ""; // Protege contra undefined
        const coordinatorB = b.coordinator || "";

        // Primero ordena por coordinator
        if (coordinatorA !== coordinatorB) {
        return sortOrder === "asc"
            ? coordinatorA.localeCompare(coordinatorB)
            : coordinatorB.localeCompare(coordinatorA);
        }

        // Si los coordinadores son iguales, ordena por supervisor
        return sortOrder === "asc"
        ? supervisorA.localeCompare(supervisorB)
        : supervisorB.localeCompare(supervisorA);
    });

    setSortedData(sorted);
  }, [selectedTeam, selectedDate, selectedIntervals, sortOrder]);

  const dataToRender = sortedData.length > 0 ? sortedData : filteredData;

  const generateSummaryText = () => {
    const selectedTimeRange = selectedIntervals.length === 1 
      ? `${selectedIntervals[0]}:00 - ${parseInt(selectedIntervals[0], 10) + 1}:59 HE` 
      : `${selectedIntervals[0]}:00 - ${selectedIntervals[selectedIntervals.length - 1]}:59 HE`;
    
    const agentsWithMoreThan2Chats = filteredData.filter((row) => row.chat_breached > 1).length;
    const totalChats = filteredData.reduce((total, row) => total + row.chat_breached, 0);
    
    return `
📌 Detalle de chats vencidos por saludo en el rango de ${selectedTimeRange}.
⚠️ ${agentsWithMoreThan2Chats} As con +1 chat vencido.
📈 Resultado: ${totalChats} chats vencidos en el tramo.
🚨Por favor su apoyo reforzando tiempos de saludo🚨
    `;
  };

  const handleCopyLinks = (links) => {
    // Si links es una cadena de texto o un arreglo de cadenas, se une con saltos de línea
    const formattedLinks = Array.isArray(links) ? links.join("\n") : links; // Si es un arreglo, lo unimos, sino lo usamos tal cual
    console.log('xd');
    console.log(links);
    console.log(formattedLinks);
    navigator.clipboard.writeText(formattedLinks).then(() => {
      console.log("Links copiados al portapapeles!");
    });
  };

  const handleGenerateSummary = () => {
    const summaryText = generateSummaryText();
    navigator.clipboard.writeText(summaryText).then(() => {
      console.log("Resumen copiado al portapapeles!");
    });
  };

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

      {/* Botones inferiores */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={handleCopyTableToClipboard}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm"
        >
          🖼️ Copiar tabla
        </button>
        <button
          onClick={handleGenerateSummary}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
        >
          Generar Resumen
        </button>
        <button
          onClick={openModal}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          Subir Datos SLA Breached
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
              <th colSpan={5} className="px-4 py-2">{selectedTeam}</th>
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
              <th className="px-4 py-2 text-left font-semibold">Coordinator</th>
              <th className="px-4 py-2 text-left font-semibold">Interval</th>
              <th className="px-4 py-2 text-left font-semibold">Chats Breached</th>
              <th className="px-4 py-2 text-left font-semibold">Link</th>
            </tr>
          </thead>
          <tbody>
            {dataToRender.map((item, index) => (
              <tr
                key={index}
                className={`${item.chat_breached > 1 ? 'bg-red-300 dark:bg-red-600' : index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-200 dark:bg-gray-700"
                } hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors *:text-center `}
              >
                <td className="px-4 py-2">{item.workerName}</td>
                <td className="px-4 py-2">{item.supervisor}</td>
                <td className="px-4 py-2">{item.coordinator}</td>
                <td className="px-4 py-2">{item.interval}</td>
                <td className="px-4 py-2">{item.chat_breached}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleCopyLinks(item.links)}
                    className="text-blue-500"
                  >
                    Link
                  </button>
                </td>
              </tr>
            ))}
            {/* Fila de Totales */}
            <tr className="bg-green-200 dark:bg-green-800 *:text-center">
              <td colSpan={4} className="px-4 py-2 font-semibold">Totales</td>
              <td className="px-4 py-2 ">{totals.chats_breached}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      
      <UploadSlaBreachedModal isOpen={isModalOpen} onClose={closeModal} onSuccess={fetchSlaBreachedData} />
    </div>
  );
}
