import { useEffect, useState } from "react";
import { usePlannedDataStore } from "../store/PlannedDataStore";
import { useRealTimeDataStore } from "../store/RealTimeDataStore";
import { toUnicodeBold } from "../../management/utils/toUnicodeBold";

export default function FcstVsRealTable() {
  const { plannedData, fetchPlannedData, loading: loadingPlanned } = usePlannedDataStore();
  const { realTimeData, fetchRealTimeData, loading: loadingReal } = useRealTimeDataStore();

  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedIntervals, setSelectedIntervals] = useState([]);
  const [analysisText, setAnalysisText] = useState("");

  useEffect(() => {
    fetchPlannedData();
    fetchRealTimeData();
  }, []);

  const loading = loadingPlanned || loadingReal;

  // 🔹 Unión de datasets
  const mergedData = plannedData.map((p) => {
    const match = realTimeData.find(
      (r) => r.team === p.team && r.date === p.date && r.interval === p.interval
    );
    return {
      ...p,
      interval: p.interval ?? match?.interval ?? "-",
      contacts_received: match?.contacts_received ?? 0,
      sla_frt: match?.sla_frt ?? 0,
      tht: match?.tht ?? 0,
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

  // 🔹 Rango horario
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0") + ":00");

  // ======================
  // 🔹 Filtrado dinámico con expansión del rango horario
  // ======================
  let filteredData = mergedData;

  if (selectedIntervals.length === 2) {
    const [start, end] = selectedIntervals.sort();
    const startIdx = hours.indexOf(start);
    const endIdx = hours.indexOf(end);
    const range = hours.slice(startIdx, endIdx + 1);

    filteredData = mergedData.filter(
      (row) =>
        (selectedTeam === "All" || row.team === selectedTeam) &&
        (selectedDate === "All" || row.date === selectedDate) &&
        range.includes(row.interval)
    );

    // 🟩 Asegurar que se muestren todos los intervalos del rango, incluso sin datos
    const existingIntervals = filteredData.map((d) => d.interval);
    const missingIntervals = range.filter((hr) => !existingIntervals.includes(hr));

    const placeholders = missingIntervals.map((hr) => ({
      team: selectedTeam === "All" ? "-" : selectedTeam,
      date: selectedDate === "All" ? "-" : selectedDate,
      interval: hr,
      forecast_received: 0,
      contacts_received: 0,
      sla_frt: 0,
      tht: 0,
    }));

    filteredData = [...filteredData, ...placeholders].sort(
      (a, b) => hours.indexOf(a.interval) - hours.indexOf(b.interval)
    );
  } else {
    filteredData = mergedData.filter((row) => {
      const matchTeam = selectedTeam === "All" || row.team === selectedTeam;
      const matchDate = selectedDate === "All" || row.date === selectedDate;
      const matchInterval =
        selectedIntervals.length === 0 || selectedIntervals.includes(row.interval);
      return matchTeam && matchDate && matchInterval;
    });
  }

  // 🔹 Manejador de selección de intervalos
  const handleIntervalClick = (hour) => {
    setSelectedIntervals((prev) => {
      if (prev.includes(hour)) return prev.filter((h) => h !== hour);
      if (prev.length === 2) return [prev[1], hour]; // reemplazar el más antiguo
      return [...prev, hour];
    });
  };

  // 🔹 Generador de análisis con formato y negritas
  const generateAnalysis = () => {
    if (selectedIntervals.length < 2) {
      setAnalysisText("⚠️ Debes seleccionar dos rangos horarios para generar el análisis.");
      return;
    }

    if (selectedDate === "All") {
      setAnalysisText("⚠️ Selecciona una fecha específica para generar el análisis.");
      return;
    }

    const [start, end] = selectedIntervals.sort();
    const startIdx = hours.indexOf(start);
    const endIdx = hours.indexOf(end);
    const selectedRange = hours.slice(startIdx, endIdx + 1);

    const dayData = mergedData.filter((d) => d.date === selectedDate);
    const dayTotalForecast = dayData.reduce((sum, d) => sum + (d.forecast_received || 0), 0);

    let text = "";
    for (let hr of selectedRange) {
      const nextHour = hours[hours.indexOf(hr) + 1];
      if (!nextHour) continue;

      const segmentData = dayData.filter((d) => d.interval === hr);
      const totalForecast = segmentData.reduce(
        (sum, d) => sum + (d.forecast_received || 0),
        0
      );
      const totalContacts = segmentData.reduce(
        (sum, d) => sum + (d.contacts_received || 0),
        0
      );

      if (totalForecast === 0) continue;

      const diff = totalContacts - totalForecast;
      const deviation = (diff / totalForecast) * 100;
      const portion = (totalForecast / dayTotalForecast) * 100;

      const hourRange = `"${hr} HE - ${hr.replace(":00", ":59")} HE"`;
      const deviationText = `"${deviation.toFixed(0)}%"`;
      const diffText = `"${diff.toFixed(0)} Q"`;
      const portionText = `"${portion.toFixed(2)}%"`;

      text += `${toUnicodeBold(hourRange)}\nSe tiene un desvío de contactos de ${toUnicodeBold(
        deviationText
      )} (${toUnicodeBold(diffText)} contactos) según lo planificado, este tramo representa un ${toUnicodeBold(
        portionText
      )} del total de contactos planificados del día.\n\n`;
    }

    if (!text) {
      setAnalysisText("⚠️ No hay datos suficientes para el rango seleccionado.");
      return;
    }

    setAnalysisText(text.trim());
    navigator.clipboard.writeText(text.trim());
  };

  if (loading) return <p className="text-gray-500">Cargando datos...</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Forecast vs Real Data</h2>

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
            fetchPlannedData(true);
            fetchRealTimeData(true);
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
            className={`px-3 py-1 text-xs rounded border ${
              selectedIntervals.includes(hour)
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {hour}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left font-semibold">Team</th>
              <th className="px-4 py-2 border-b text-left font-semibold">Date</th>
              <th className="px-4 py-2 border-b text-left font-semibold">Interval</th>
              <th className="px-4 py-2 border-b text-left font-semibold">Forecast Received</th>
              <th className="px-4 py-2 border-b text-left font-semibold">Contacts Received</th>
              <th className="px-4 py-2 border-b text-left font-semibold">SLA FRT</th>
              <th className="px-4 py-2 border-b text-left font-semibold">THT</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition-colors ${
                  item.forecast_received === 0 && item.contacts_received === 0
                    ? "text-gray-400 italic"
                    : ""
                }`}
              >
                <td className="px-4 py-2 border-b">{item.team}</td>
                <td className="px-4 py-2 border-b">{item.date}</td>
                <td className="px-4 py-2 border-b">{item.interval}</td>
                <td className="px-4 py-2 border-b text-blue-600 font-medium">
                  {item.forecast_received ?? "-"}
                </td>
                <td className="px-4 py-2 border-b text-green-600 font-medium">
                  {item.contacts_received ?? "-"}
                </td>
                <td className="px-4 py-2 border-b">
                  {item.sla_frt ? `${(item.sla_frt * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-4 py-2 border-b">{item.tht?.toFixed(2) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generar análisis */}
      <button
        onClick={generateAnalysis}
        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
      >
        📋 Copiar análisis
      </button>

      {analysisText && (
        <pre className="mt-4 bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap text-sm">
          {analysisText}
        </pre>
      )}
    </div>
  );
}
