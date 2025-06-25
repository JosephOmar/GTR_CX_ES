import React, { useState, useEffect } from "react";
import { expandOvernight } from "../utils/scheduleUtils";
import html2canvas from "html2canvas-pro";

export function WorkersTable({ workers, selectedDate }) {
  const [imgCopied, setImgCopied] = useState(false); // Estado para manejar el estado de copia
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" }); // Estado para el orden de columnas
  const [sortedWorkers, setSortedWorkers] = useState(workers);

  // Función para manejar el orden de las columnas
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...workers].sort((a, b) => {
      // Para las columnas name y supervisor accedemos directamente
      if (key === "name" || key === "supervisor") {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      }
      // Para la columna team accedemos a a.team.name y b.team.name
      if (key === "team") {
        const teamA = a.team?.name || ""; // Si no existe team, usamos cadena vacía
        const teamB = b.team?.name || ""; // Lo mismo para b.team
        if (teamA < teamB) return direction === "asc" ? -1 : 1;
        if (teamA > teamB) return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key, direction });
    setSortedWorkers(sortedData);
  };

  // useEffect para actualizar el orden cuando cambien los workers
  useEffect(() => {
    setSortedWorkers(workers);
  }, [workers]);

  const handleCopyToClipboard = async () => {
    // Seleccionamos la sección de la tabla
    const tableSection = document.getElementById("workers-table-section");

    if (!tableSection) return;

    // Seleccionamos todas las filas de la tabla
    const rows = tableSection.querySelectorAll("tr");

    // Ocultamos las celdas fuera de las 6 primeras columnas
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td, th"); // Incluimos tanto th como td
      cells.forEach((cell, index) => {
        if (index >= 6) {
          // Ocultamos las columnas después de la columna 6
          cell.style.display = "none";
        }
      });
    });

    try {
      const canvas = await html2canvas(tableSection, { scale: 2 });
      canvas.toBlob((blob) => {
        if (!blob) return;
        navigator.clipboard
          .write([new ClipboardItem({ "image/png": blob })])
          .then(() => {
            setImgCopied(true);
            setTimeout(() => setImgCopied(false), 1000);
          });
      });
    } catch (e) {
      console.error(e);
    } finally {
      // Restauramos la visibilidad de las celdas después de la captura
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td, th");
        cells.forEach((cell) => {
          cell.style.display = ""; // Restauramos la visibilidad
        });
      });
    }
  };

  return (
    <div>
      <button
        onClick={handleCopyToClipboard}
        className={` text-white p-2 rounded mb-4 transition-colors ${
          imgCopied ? "bg-green-500" : "glovo-blue-accent"
        }`}
      >
        {imgCopied ? "¡Imagen Copiada!" : "Capturar Imagen"}
      </button>

      <div className="overflow-x-auto" id="workers-table-section">
        <table className="min-w-full divide-y divide-gray-300 table-auto border-collapse">
          <thead className="bg-gray-50">
            <tr className="glovo-red-accent *:font-semibold *:text-white">
              {[
                "Document",
                "Name",
                "Team",
                "Supervisor",
                "Contract Type",
                "Schedule",
                "Break",
                "Observation 1",
                "Observation 2",
                "Kustomer Name",
                "Kustomer Link",
              ].map((h, i) => (
                <th
                  key={i}
                  className="px-2 py-2 text-left font-medium cursor-pointer"
                  onClick={() => {
                    if (h === "Name" || h === "Supervisor" || h === "Team") {
                      handleSort(h.toLowerCase());
                    }
                  }}
                >
                  {h}
                  {sortConfig.key === h.toLowerCase() && (
                    <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedWorkers.map((w, idx) => {
              const turns =
                w.contract_type?.name === "UBYCALL"
                  ? w.ubycall_schedules
                  : w.schedules;

              // Filtrar los turnos para el día seleccionado
              const filteredTurns = expandOvernight(turns).filter(
                (f) => f.date === selectedDate
              );

              // Si se filtra correctamente, los turnos deben estar disponibles
              const slots = filteredTurns.map((f, i) => (
                <div key={i}>
                  {f.start && f.end ? (
                    `${f.start} - ${f.end}`
                  ) : (
                    <em>Descanso</em>
                  )}
                </div>
              ));

              // Obtener los valores de break_start y break_end desde w.schedules
              const breakInfo = filteredTurns.length
                ? filteredTurns.map((f, i) => (
                    <div key={i}>
                      {f.break_start && f.break_end
                        ? `${f.break_start} - ${f.break_end}`
                        : "—"}
                    </div>
                  ))
                : "—"; // Si no hay turnos para el día, mostramos un guion

              if (w.document === "70499497") {
                console.log(filteredTurns); // Verifica si los turnos están siendo filtrados correctamente
              }

              return (
                <tr
                  key={w.document}
                  className={`${idx % 2 === 0 ? "glovo-red" : ""} font-medium`}
                >
                  <td className="px-2 py-1">{w.document}</td>
                  <td className="px-2 py-1">{w.name}</td>
                  <td className="px-2 py-1">{w.team?.name}</td>
                  <td className="px-2 py-1">{w.supervisor}</td>
                  <td className="px-2 py-1">{w.contract_type?.name || "—"}</td>
                  <td className="px-2 py-1">
                    {slots.length ? slots : <em>Sin horario</em>}
                  </td>
                  <td className="px-2 py-1">{breakInfo}</td>
                  <td className="px-2 py-1">{w.observation_1 || "—"}</td>
                  <td className="px-2 py-1">{w.observation_2 || "—"}</td>
                  <td className="px-2 py-1">{w.kustomer_name || "—"}</td>
                  <td className="px-2 py-1">
                    {w.kustomer_id ? (
                      <a
                        href={`https://glovo.kustomerapp.com/app/users/status?u=${w.kustomer_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600"
                      >
                        Link
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
