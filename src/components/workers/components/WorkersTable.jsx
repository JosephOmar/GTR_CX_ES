import React, { useState, useEffect } from "react";
import { expandOvernight } from "../utils/scheduleUtils";
import html2canvas from "html2canvas-pro";
import { getTurnsForWorker, getStartMinutes, chooseAttendanceDate, getAttendancePriority } from "../../utils/UtilsFormatDate";

export function WorkersTable({ workers, selectedDate }) {
  const [imgCopied, setImgCopied] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [sortedWorkers, setSortedWorkers] = useState(workers);
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const workersPerPage = 150; // Número máximo de trabajadores por página

  const showTerminationColumn = workers.some(
    (w) => w.status?.name === "Inactivo"
  );

  const headers = [
    "Document",
    "Name",
    "Team",
    "Role",
    "Supervisor",
    "Contract Type",
    "Schedule",
    "Break",
    "Attendance",
    "Check In",
    "Check Out",
    "Out Of Adherence",
    "Offline Minutes",
    "HC Email",
    "Obs",
    "Observation 1",
    ...(showTerminationColumn ? ["Termination Date"] : []),
  ];

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...workers].sort((a, b) => {
      if (key === "schedule") {
        const startA = getStartMinutes(a, selectedDate);
        const startB = getStartMinutes(b, selectedDate);
        return direction === "asc" ? startA - startB : startB - startA;
      }

      if (key === "name" || key === "supervisor") {
        const valA = a[key] || "";
        const valB = b[key] || "";
        return direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (key === "team") {
        const valA = a.team?.name || "";
        const valB = b.team?.name || "";
        return direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (key === "attendance") {
        const turnsA = getTurnsForWorker(a, selectedDate);
        const turnsB = getTurnsForWorker(b, selectedDate);

        const effDateA = chooseAttendanceDate(selectedDate, turnsA);
        const effDateB = chooseAttendanceDate(selectedDate, turnsB);

        const rankA = getAttendancePriority(a, effDateA);
        const rankB = getAttendancePriority(b, effDateB);

        return direction === "asc" ? rankA - rankB : rankB - rankA;
      }

      if (key === "out_of_adherence" || key === "offline_minutes") {
        const attA = a.attendances?.find((att) => att.date === selectedDate);
        const attB = b.attendances?.find((att) => att.date === selectedDate);
        const rawA = attA?.[key] ?? Infinity;
        const rawB = attB?.[key] ?? Infinity;
        const valA = rawA != null && rawA !== "" ? rawA : Infinity;
        const valB = rawB != null && rawB !== "" ? rawB : Infinity;

        return direction === "asc" ? valA - valB : valB - valA;
      }

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

  useEffect(() => {
    setSortedWorkers(workers);
  }, [workers]);

  // ==============================
  //  Copiar tabla como imagen
  // ==============================
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

  // ==============================
  //  Paginar
  // ==============================
  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = sortedWorkers.slice(indexOfFirstWorker, indexOfLastWorker);

  const totalPages = Math.ceil(workers.length / workersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // ==============================
  //  Render
  // ==============================
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
                      if (
                        [
                          "name",
                          "supervisor",
                          "team",
                          "termination_date",
                          "schedule",
                          "attendance",
                          "out_of_adherence",
                          "offline_minutes",
                        ].includes(key)
                      ) {
                        handleSort(key);
                      }
                    }}
                  >
                    {h}
                    {sortConfig.key === key && (
                      <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-main">
            {currentWorkers.map((w, idx) => {
              const turns =
                w.contract_type?.name === "UBYCALL"
                  ? w.ubycall_schedules
                  : w.schedules;

              const filtered = expandOvernight(turns).filter(
                (f) => f.start_date === selectedDate
              );

              const slots = filtered.map((f, i) => (
                <div key={i}>
                  {f.start && f.end ? `${f.start} - ${f.end}` : <em>Descanso</em>}
                </div>
              ));

              const breakInfo = filtered.length
                ? filtered[0].break_start && filtered[0].break_end
                  ? `${filtered[0].break_start} - ${filtered[0].break_end}`
                  : "—"
                : "—";

              const scheduleObs = w.schedules.map((s) =>
                s.start_date === selectedDate ? s.obs || "" : ""
              );
              const hasObs = scheduleObs.some((obs) => obs !== "");

              const hasTrainee = (w.tenure === 1 && w.team?.name === 'CUSTOMER TIER1');

              const hasSupport = w.productive?.includes("No")

              const effectiveAttendDate = chooseAttendanceDate(selectedDate, filtered);
              const attendance = w.attendances?.find(
                (a) => a.date === effectiveAttendDate
              );

              return (
                <tr
                  key={w.document}
                  className={`*:px-2 *:py-1 *:truncate ${
                    hasObs
                      ? "table-row-obs"
                      :hasSupport
                      ? "table-row-support"
                      :hasTrainee
                      ? "table-row-trainee"
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
                  <td
                    className={`${
                      attendance?.status === "Present"
                        ? "bg-[#10b981] dark:bg-[#038d5a]"
                        : attendance?.status === "Late"
                        ? "bg-[#dd9e33] dark:bg-[#bc7904]"
                        : "bg-[#e58787] dark:bg-[#b32626]"
                    }`}
                  >
                    {attendance?.status || "Absent"}
                  </td>
                  <td>{attendance?.check_in || ""}</td>
                  <td>{attendance?.check_out || ""}</td>
                  <td>{attendance?.out_of_adherence || ""}</td>
                  <td>{attendance?.offline_minutes || ""}</td>
                  <td>{w.api_email || "—"}</td>
                  <td>{scheduleObs}</td>
                  <td>
                    {`${hasSupport ? w.observation_1?.split(" ").slice(0, 3).join(" ") : ""}`}
                  </td>

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

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-l"
        >
          Anterior
        </button>
        <span className="px-4 py-2">{`Página ${currentPage} de ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-r"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
