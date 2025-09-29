import React, { useState, useEffect } from "react";
import { expandOvernight } from "../utils/scheduleUtils";
import html2canvas from "html2canvas-pro";

export function WorkersTable({ workers, selectedDate }) {
  const [imgCopied, setImgCopied] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [sortedWorkers, setSortedWorkers] = useState(workers);

  // Mostrar columna de termination date si hay inactivos
  const showTerminationColumn = workers.some(
    (w) => w.status?.name === "Inactivo"
  );

  // Definición de encabezados
  const headers = [
    "Document",
    "Name",
    "Team",
    "Role",
    "Supervisor",
    "Contract Type",
    "Schedule",
    "Break",
    "HC Email",
    "Observation 1",
    "Observation 2",
    ...(showTerminationColumn ? ["Termination Date"] : []),
  ];

  // Helper para convertir "HH:MM" a minutos
  const parseTime = (str) => {
    if (!str) return null;
    const [h, m] = str.split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  };

  // Función de sorting genérica
  const handleSort = (key) => {
    let direction = "asc";
    // Para 'schedule', turno de asc a desc para cambiar entre entrada y salida
    if (key === "schedule") {
      if (sortConfig.key !== "schedule") {
        direction = "asc"; // primer click: ordenar por Hora de entrada ascendente
      } else {
        direction = sortConfig.direction === "asc" ? "desc" : "asc";
      }
    } else {
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
    }

    const sortedData = [...workers].sort((a, b) => {
      // Orden para 'schedule'
      if (key === "schedule") {
        const turnsA = expandOvernight(
          a.contract_type?.name === "UBYCALL"
            ? a.ubycall_schedules
            : a.schedules
        ).filter((f) => f.date === selectedDate);

        const turnsB = expandOvernight(
          b.contract_type?.name === "UBYCALL"
            ? b.ubycall_schedules
            : b.schedules
        ).filter((f) => f.date === selectedDate);

        // calcular la hora mínima de ingreso
        const startA = turnsA.length
          ? Math.min(...turnsA.map((f) => parseTime(f.start)))
          : Infinity;
        const startB = turnsB.length
          ? Math.min(...turnsB.map((f) => parseTime(f.start)))
          : Infinity;

        // toggle solo en base a la hora de ingreso
        return direction === "asc" ? startA - startB : startB - startA;
      }

      // Orden alfabético para name y supervisor
      if (key === "name" || key === "supervisor") {
        const valA = a[key] || "";
        const valB = b[key] || "";
        return direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Orden alfabético para team.name
      if (key === "team") {
        const valA = a.team?.name || "";
        const valB = b.team?.name || "";
        return direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Orden por fecha para termination_date
      if (key === "termination_date") {
        const timeA = a.termination_date
          ? new Date(a.termination_date).getTime()
          : direction === "asc"
          ? Infinity
          : -Infinity;
        const timeB = b.termination_date
          ? new Date(b.termination_date).getTime()
          : direction === "asc"
          ? Infinity
          : -Infinity;
        return direction === "asc" ? timeA - timeB : timeB - timeA;
      }

      return 0;
    });

    setSortConfig({ key, direction });
    setSortedWorkers(sortedData);
  };

  // Resetear lista ordenada al cambiar workers
  useEffect(() => {
    setSortedWorkers(workers);
  }, [workers]);

  // Función para copiar la tabla como imagen
  const handleCopyToClipboard = async () => {
    const tableSection = document.getElementById("workers-table-section");
    if (!tableSection) return;
    const rows = tableSection.querySelectorAll("tr");
    rows.forEach((row) => {
      row.querySelectorAll("td, th").forEach((cell, idx) => {
        if (idx >= 7) cell.style.display = "none";
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
      rows.forEach((row) => {
        row.querySelectorAll("td, th").forEach((cell) => {
          cell.style.display = "";
        });
      });
    }
  };

  return (
    <div>
      <button
        onClick={handleCopyToClipboard}
        className={`text-white p-2 rounded mb-4 transition-colors ${
          imgCopied ? "bg-green-500" : ""
        }`}
      >
        {imgCopied ? "¡Imagen Copiada!" : "Capturar Imagen"}
      </button>

      <div className="overflow-x-auto" id="workers-table-section">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50">
            <tr className=" *:font-semibold bg-primary *:text-white">
              {headers.map((h, i) => {
                const key = h.toLowerCase().replace(/ /g, "_");
                return (
                  <th
                    key={i}
                    className="px-2 py-2 text-left font-medium cursor-pointer"
                    onClick={() => {
                      // Incluir 'schedule' en los campos ordenables
                      if (
                        [
                          "name",
                          "supervisor",
                          "team",
                          "termination_date",
                          "schedule",
                        ].includes(key)
                      ) {
                        handleSort(key);
                      }
                    }}
                  >
                    {h}
                    {sortConfig.key === key && (
                      <span>
                        {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-main">
            {sortedWorkers.map((w, idx) => {
              const turns =
                w.contract_type?.name === "UBYCALL"
                  ? w.ubycall_schedules
                  : w.schedules;

              const filtered = expandOvernight(turns).filter(
                (f) => f.date === selectedDate
              );
              const slots = filtered.map((f, i) => (
                <div key={i}>
                  {f.start && f.end ? (
                    `${f.start} - ${f.end}`
                  ) : (
                    <em>Descanso</em>
                  )}
                </div>
              ));
              const breakInfo = filtered.length
                ? filtered[0].break_start && filtered[0].break_end
                  ? `${filtered[0].break_start} - ${filtered[0].break_end}`
                  : "—"
                : "—";

              const schedule = w.schedules.map((item) => {
                // Compara las fechas y retorna 'obs' si coincide con 'selectedDate', o un string vacío
                if (item.date === selectedDate) {
                  return item.obs || ""; // Retorna el valor de 'obs' o un string vacío si no tiene valor
                }
                return ""; // Si no coincide la fecha, retorna un string vacío
              });
              const hasObs = schedule.some((obs) => obs !== "");
              console.log(hasObs);
              return (
                <tr
                  key={w.document}
                  className={`*:px-2 *:py-1 *:truncate ${
                    hasObs
                      ? "table-row-vac"
                      : idx % 2 === 0
                      ? "table-row-even"
                      : "table-row-odd"
                  } font-medium`}
                >
                  <td>{w.document}</td>
                  <td>{w.name}</td>
                  <td>{w.team?.name}</td>
                  <td>{w.role?.name}</td>
                  <td>{w.supervisor}</td>
                  <td>{w.contract_type?.name || "—"}</td>
                  <td>{slots.length ? slots : <em>Sin horario</em>}</td>
                  <td>{breakInfo}</td>
                  <td>{w.kustomer_email || "—"}</td>
                  <td>{w.observation_1 || "—"}</td>
                  <td>{w.observation_2 || "—"}</td>
                  {/* <td>{w.kustomer_name || "—"}</td>
                  <td>
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
                  </td> */}
                  {showTerminationColumn && (
                    <td>
                      {w.status?.name === "Inactivo"
                        ? w.termination_date || "—"
                        : "—"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
