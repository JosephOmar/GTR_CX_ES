import { useEffect, useState, useRef } from "react";
import { usePlannedDataStore } from "../store/PlannedDataStore";
import { useRealTimeDataStore } from "../store/RealTimeDataStore";
import { toUnicodeBold } from "../../management/utils/toUnicodeBold";
import html2canvas from "html2canvas-pro";

export default function FcstVsRealTable() {
  const {
    plannedData,
    fetchPlannedData,
    loading: loadingPlanned,
  } = usePlannedDataStore();
  const {
    realTimeData,
    fetchRealTimeData,
    loading: loadingReal,
  } = useRealTimeDataStore();

  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedIntervals, setSelectedIntervals] = useState([]);
  const [analysisText, setAnalysisText] = useState("");

  const tableRef = useRef(null);

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
    const forecast = p.forecast_received || 0;
    const contacts = match?.contacts_received || 0;
    const deviationQ = contacts - forecast;
    const deviationPct = forecast ? (deviationQ / forecast) * 100 : 0;

    return {
      ...p,
      interval: p.interval ?? match?.interval ?? "-",
      contacts_received: contacts,
      sla_frt: match?.sla_frt ?? 0,
      tht: match?.tht ?? 0,
      deviation_q: deviationQ,
      deviation_pct: deviationPct,
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
    // 🟩 incluir intervalos sin datos
    const existingIntervals = filteredData.map((d) => d.interval);
    const missingIntervals = range.filter(
      (hr) => !existingIntervals.includes(hr)
    );

    const placeholders = missingIntervals.map((hr) => ({
      team: selectedTeam === "All" ? "-" : selectedTeam,
      date: selectedDate === "All" ? "-" : selectedDate,
      interval: hr,
      forecast_received: 0,
      contacts_received: 0,
      sla_frt: 0,
      tht: 0,
      deviation_q: 0,
      deviation_pct: 0,
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
      if (prev.length === 2) return [prev[1], hour]; // reemplaza el más antiguo
      return [...prev, hour];
    });
  };

  // 🔹 Copiar tabla como imagen
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

  // 🔹 Generador de análisis con formato y negritas (CORREGIDO: filtra por fecha y equipo)
  const generateAnalysis = () => {
    if (selectedIntervals.length < 1) {
      setAnalysisText(
        "⚠️ Debes seleccionar al menos un rango horario para generar el análisis."
      );
      return;
    }

    if (selectedDate === "All") {
      setAnalysisText(
        "⚠️ Selecciona una fecha específica para generar el análisis."
      );
      return;
    }

    const [start] = [...selectedIntervals];
    const selectedRange = [start]; // Solo un rango

    // 🔸 Filtra por fecha y por equipo (coherente con la tabla)
    const dayData = mergedData.filter(
      (d) =>
        d.date === selectedDate &&
        (selectedTeam === "All" || d.team === selectedTeam)
    );

    // Total forecast del día SOLO del equipo seleccionado (o de todos si "All")
    const dayTotalForecast = dayData.reduce(
      (sum, d) => sum + (d.forecast_received || 0),
      0
    );

    let text = "";
    for (let hr of selectedRange) {
      const segmentData = dayData.filter(
        (d) =>
          d.interval === hr &&
          (selectedTeam === "All" || d.team === selectedTeam)
      );

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
      const portion = dayTotalForecast
        ? (totalForecast / dayTotalForecast) * 100
        : 0;

      const hourRange = `${hr} HE - ${hr.replace(":00", ":59")} HE`;
      const deviationText = `${deviation.toFixed(0)}%`;
      const diffText = `${diff.toFixed(0)} Q`;
      const portionText = `${portion.toFixed(2)}%`;

      text += `${toUnicodeBold(
        hourRange
      )}\nSe tiene un desvío de contactos de ${toUnicodeBold(
        deviationText
      )} (${toUnicodeBold(
        diffText
      )} contactos) según lo planificado, este tramo representa un ${toUnicodeBold(
        portionText
      )} del total de contactos planificados del día.\n\n`;
    }

    if (!text) {
      setAnalysisText(
        "⚠️ No hay datos suficientes para el rango seleccionado."
      );
      return;
    }

    setAnalysisText(text.trim());
    navigator.clipboard.writeText(text.trim());
  };

  const generateEmail = (startHour, endHour) => {
    // Paso 1: Filtra los intervalos seleccionados
    const selectedRange = hours.filter(
      (hour) => hour >= startHour && hour <= endHour
    );

    // Paso 2: Filtra los datos para la fecha seleccionada
    const dayData = mergedData.filter((d) => d.date === selectedDate);

    // Equipos a considerar en el resumen
    const teamsSummary = [
      "Customer Tier1",
      "Rider Tier1",
      "Vendor Tier1",
      "Customer Tier2",
      "Rider Tier2",
      "Vendor Tier2",
    ];

    // Paso 3: Crear el encabezado del correo
    let emailText = `Estimados,\n\n    Se comparte el resumen del tramo desde las ${startHour} hasta las ${endHour} HE de las siguientes verticales:\n\n`;

    // Paso 4: Iterar por cada equipo y filtrar los datos por intervalos seleccionados
    teamsSummary.forEach((team) => {
      // Filtrar los datos del equipo
      const teamData = dayData.filter((d) => d.team === team);

      // Filtrar los datos de los intervalos seleccionados
      const selectedTeamData = teamData.filter((d) =>
        selectedRange.includes(d.interval)
      );

      // Sumar los valores de Forecast, Contacts, THT y SLA para el equipo y los intervalos seleccionados
      const totalForecast = selectedTeamData.reduce(
        (sum, d) => sum + (d.forecast_received || 0),
        0
      );
      const totalContacts = selectedTeamData.reduce(
        (sum, d) => sum + (d.contacts_received || 0),
        0
      );
      const totalTHT = selectedTeamData.reduce(
        (sum, d) => sum + (d.tht || 0),
        0
      );
      const totalSLA = selectedTeamData.reduce(
        (sum, d) => sum + (d.sla_frt || 0),
        0
      );

      // **Nuevo**: Ajustar el cálculo de THT para que use forecast_tht
      const forecastTHT = selectedTeamData.reduce(
        (sum, d) => sum + (d.forecast_tht || 0),
        0
      );
      const deviationTHT = forecastTHT
        ? ((totalTHT - forecastTHT) / forecastTHT) * 100
        : 0;

      // Calcular promedios ponderados de THT y SLA
      const weightedTHT = selectedTeamData.reduce(
        (sum, d) => sum + (d.tht || 0) * (d.contacts_received || 0),
        0
      );
      const avgTHT = totalContacts ? weightedTHT / totalContacts : 0;

      const weightedSLA = selectedTeamData.reduce(
        (sum, d) => sum + (d.sla_frt || 0) * (d.contacts_received || 0),
        0
      );
      const avgSLA = totalContacts ? weightedSLA / totalContacts : 0;

      const contactsDiff = totalContacts - totalForecast;
      const deviationPct = totalForecast
        ? (contactsDiff / totalForecast) * 100
        : 0;

      // **Nuevo**: Ajustar el texto para el "Se atendió" según el signo de deviation_q
      const deviationQText =
        contactsDiff >= 0
          ? `+${contactsDiff.toFixed(0)}Q (+${deviationPct.toFixed(2)}%)`
          : `${contactsDiff.toFixed(0)}Q (${deviationPct.toFixed(2)}%)`;

      // **Nuevo**: Ajustar el texto de la desviación de THT para mostrar el "+" si es positivo
      const deviationTHTText =
        deviationTHT > 0
          ? `+${deviationTHT.toFixed(2)}%`
          : `${deviationTHT.toFixed(2)}%`;

      // Añadir información al resumen del correo
      emailText += `${team}\n    -THT: ${avgTHT.toFixed(
        2
      )} (${deviationTHTText})\n    -SLA: ${(avgSLA * 100).toFixed(
        2
      )}%\n    -Se atendió ${deviationQText} de los contactos previstos\n    -Absentismo: \n\n`;
    });

    emailText += `Saludos,\n`
    // Paso 5: Copiar el correo al portapapeles
    copyToClipboard(emailText);

    // Paso 6: Establecer el texto generado en el estado para mostrarlo
    setAnalysisText(emailText);
  };

  // Función para copiar el texto al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log("Correo copiado al portapapeles con éxito!");
      },
      (err) => {
        console.error("Error al copiar al portapapeles: ", err);
      }
    );
  };

  // Cálculo de los totales con ponderación (ajustado)
  const calculateTotals = (data) => {
    const totalForecast = data.reduce(
      (sum, d) => sum + (d.forecast_received || 0),
      0
    );
    const totalContacts = data.reduce(
      (sum, d) => sum + (d.contacts_received || 0),
      0
    );
    const totalTHT = data.reduce((sum, d) => sum + (d.tht || 0), 0);
    const totalSLA = data.reduce((sum, d) => sum + (d.sla_frt || 0), 0);

    // **Nuevo**: Ajuste para calcular el THT de acuerdo al forecast_tht
    const forecastTHT = data.reduce((sum, d) => sum + (d.forecast_tht || 0), 0);
    const deviationTHT = forecastTHT
      ? ((totalTHT - forecastTHT) / forecastTHT) * 100
      : 0;

    // Cálculo ponderado de THT y SLA
    const weightedTHT = data.reduce(
      (sum, d) => sum + (d.tht || 0) * (d.contacts_received || 0),
      0
    );
    const avgTHT = totalContacts ? weightedTHT / totalContacts : 0;

    const weightedSLA = data.reduce(
      (sum, d) => sum + (d.sla_frt || 0) * (d.contacts_received || 0),
      0
    );
    const avgSLA = totalContacts ? weightedSLA / totalContacts : 0;

    return {
      team: "Totales",
      interval: "Total",
      forecast_received: totalForecast,
      contacts_received: totalContacts,
      deviation_q: totalContacts - totalForecast,
      deviation_pct: totalForecast
        ? ((totalContacts - totalForecast) / totalForecast) * 100
        : 0,
      sla_frt: avgSLA,
      tht: avgTHT,
      forecast_tht: forecastTHT, // Considera forecast_tht para el cálculo del total
    };
  };
  if (loading) return <p className="text-gray-500">Cargando datos...</p>;

  const totals = calculateTotals(filteredData);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Forecast vs Real Data</h2>

      {/* Filtros principales */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Equipo:
          </label>
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
          <label className="block text-sm font-medium text-gray-700">
            Fecha:
          </label>
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
      <div ref={tableRef} className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 rounded-lg shadow-sm text-sm">
          <thead className="bg-gray-100">
            <tr className="*:text-center">
              <th className="px-4 py-2 text-left font-semibold">
                {filteredData[0]?.date}
              </th>
              <th colSpan={6} className="px-4 py-2 text-left font-semibold">
                {filteredData[0]?.team}
              </th>
            </tr>
            <tr className="*:text-center">
              <th className="px-4 py-2 text-left font-semibold">Interval</th>
              <th className="px-4 py-2 text-left font-semibold">
                Forecast Received
              </th>
              <th className="px-4 py-2 text-left font-semibold">
                Contacts Received
              </th>
              <th className="px-4 py-2 text-left font-semibold">
                Deviation (Q)
              </th>
              <th className="px-4 py-2 text-left font-semibold">
                Deviation (%)
              </th>
              <th className="px-4 py-2 text-left font-semibold">SLA FRT</th>
              <th className="px-4 py-2 text-left font-semibold">THT</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-200"
                } hover:bg-gray-100 transition-colors ${
                  item.forecast_received === 0 && item.contacts_received === 0
                    ? "text-gray-400 italic"
                    : ""
                } *:text-center`}
              >
                <td className="px-4 py-2">{item.interval}</td>
                <td className="px-4 py-2 font-medium">
                  {item.forecast_received ?? "-"}
                </td>
                <td className="px-4 py-2 font-medium">
                  {item.contacts_received ?? "-"}
                </td>
                <td
                  className={`${
                    (item.deviation_q ?? 0) > 0
                      ? "text-red-500"
                      : "text-green-500"
                  } px-4 py-2 font-medium`}
                >
                  {item.deviation_q?.toFixed(0)}
                </td>
                <td
                  className={`${
                    (item.deviation_pct ?? 0) > 0
                      ? "text-red-500"
                      : "text-green-500"
                  } px-4 py-2 font-medium`}
                >
                  {item.deviation_pct
                    ? `${item.deviation_pct.toFixed(0)}%`
                    : "-"}
                </td>
                <td
                  className={`${
                    ((item.sla_frt || 0) * 100).toFixed(2) > 85
                      ? "text-green-500"
                      : "text-red-500"
                  } px-4 py-2 font-medium`}
                >
                  {item.sla_frt ? `${(item.sla_frt * 100).toFixed(2)}%` : "-"}
                </td>
                <td className="px-4 py-2">{item.tht?.toFixed(2) ?? "-"}</td>
              </tr>
            ))}

            {/* Fila de Totales */}
            <tr className="bg-gray-200 *:text-center">
              <td className="px-4 py-2 font-semibold">Totales</td>
              <td className="px-4 py-2">{totals.forecast_received}</td>
              <td className="px-4 py-2">{totals.contacts_received}</td>
              <td className="px-4 py-2">{totals.deviation_q}</td>
              <td className="px-4 py-2">{totals.deviation_pct.toFixed(2)}%</td>
              <td className="px-4 py-2">
                {(totals.sla_frt * 100).toFixed(2)}%
              </td>
              <td className="px-4 py-2">{totals.tht.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Botones inferiores */}
      <div className="flex gap-3">
        <button
          onClick={generateAnalysis}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
        >
          📋 Copiar análisis
        </button>

        <button
          onClick={copyTableAsImage}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm"
        >
          🖼️ Copiar tabla
        </button>
      </div>

      <div className="flex gap-3 mt-4">
        {/* Botones de generar correo por rango */}
        <button
          onClick={() => generateEmail("00:00", "05:59")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          📧 Generar Correo 00:00 - 05:59
        </button>
        <button
          onClick={() => generateEmail("06:00", "11:59")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          📧 Generar Correo 06:00 - 11:59
        </button>
        <button
          onClick={() => generateEmail("12:00", "17:59")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          📧 Generar Correo 12:00 - 17:59
        </button>
        <button
          onClick={() => generateEmail("00:00", "23:59")}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          📧 Generar Correo Día Completo
        </button>
      </div>

      {/* Mostrar análisis generado */}
      {analysisText && (
        <pre className="mt-4 bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap text-sm">
          {analysisText}
        </pre>
      )}
    </div>
  );
}
