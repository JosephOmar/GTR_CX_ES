import React, { useState, useEffect } from "react";
import { expandOvernight } from "../utils/scheduleUtils";
import html2canvas from "html2canvas-pro";

export function WorkersTable({ workers, selectedDate }) {
  const [imgCopied, setImgCopied] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [sortedWorkers, setSortedWorkers] = useState(workers);

  // ==============================
  //  🔧 Configuración y helpers (zona horaria Lima)
  // ==============================
  const TIMEZONE = "America/Lima";
  const CUTOFF_MINUTES = 9 * 60; // 09:00 (Lima)
  // Por defecto 0 => SOLO 00:00. Si quieres incluir hasta las 02:00, pon 120.
  const ALLOWED_OVERNIGHT_START_MINUTES = 0;

  // Hora/fecha actual en Lima
  const getNowInTZ = (timeZone) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const date = `${map.year}-${map.month}-${map.day}`;
    const minutes = parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10);
    return { date, minutes };
  };
  const { date: todayISO_Lima, minutes: nowMinutes_Lima } = getNowInTZ(TIMEZONE);

  // YYYY-MM-DD -> YYYY-MM-DD (día anterior, sin sesgos de TZ)
  const prevDateStr = (iso) => {
    const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - 1);
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  // Helper "HH:MM" -> minutos
  const parseTime = (str) => {
    if (!str) return null;
    const [h, m] = str.split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  };

  // ¿El primer bloque del día arranca dentro del umbral permitido?
  // Con el valor por defecto (0) esto equivale a "empieza a 00:00".
  const startsWithinOvernightThreshold = (slots) => {
    const mins = slots
      .map((s) => parseTime(s.start))
      .filter((v) => Number.isFinite(v));
    if (!mins.length) return false;
    const earliest = Math.min(...mins);
    return earliest <= ALLOWED_OVERNIGHT_START_MINUTES;
  };

  // Decide la fecha "efectiva" para leer asistencia
  const chooseAttendanceDate = (selDate, filteredSlots) => {
    const isTodayInLima = selDate === todayISO_Lima;
    if (
      isTodayInLima &&
      nowMinutes_Lima < CUTOFF_MINUTES &&
      startsWithinOvernightThreshold(filteredSlots)
    ) {
      return prevDateStr(selDate); // leer asistencia de AYER
    }
    return selDate; // de lo contrario, del propio día
  };

  // ==============================
  // Mostrar columna de termination date si hay inactivos
  // ==============================
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
    "HC Email",
    "Obs",
    "Observation 1",
    ...(showTerminationColumn ? ["Termination Date"] : []),
  ];

  // ==============================
  //  Ordenamiento
  // ==============================
  const handleSort = (key) => {
    let direction = "asc";
    if (key === "schedule") {
      direction =
        sortConfig.key !== "schedule"
          ? "asc"
          : sortConfig.direction === "asc"
          ? "desc"
          : "asc";
    } else if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...workers].sort((a, b) => {
      if (key === "schedule") {
        const turnsA = expandOvernight(
          a.contract_type?.name === "UBYCALL" ? a.ubycall_schedules : a.schedules
        ).filter((f) => f.date === selectedDate);
        const turnsB = expandOvernight(
          b.contract_type?.name === "UBYCALL" ? b.ubycall_schedules : b.schedules
        ).filter((f) => f.date === selectedDate);

        const startA = turnsA.length
          ? Math.min(...turnsA.map((f) => parseTime(f.start)))
          : Infinity;
        const startB = turnsB.length
          ? Math.min(...turnsB.map((f) => parseTime(f.start)))
          : Infinity;

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
        const turnsA = expandOvernight(
          a.contract_type?.name === "UBYCALL" ? a.ubycall_schedules : a.schedules
        ).filter((f) => f.date === selectedDate);
        const turnsB = expandOvernight(
          b.contract_type?.name === "UBYCALL" ? b.ubycall_schedules : b.schedules
        ).filter((f) => f.date === selectedDate);

        const effDateA = chooseAttendanceDate(selectedDate, turnsA);
        const effDateB = chooseAttendanceDate(selectedDate, turnsB);

        const attA = a.attendances?.find((att) => att.date === effDateA);
        const attB = b.attendances?.find((att) => att.date === effDateB);

        const valA = attA?.status || "";
        const valB = attB?.status || "";

        const priority = { Present: 1, Late: 2, Absent: 3, "": 4 };
        const rankA = priority[valA] ?? 99;
        const rankB = priority[valB] ?? 99;

        return direction === "asc" ? rankA - rankB : rankB - rankA;
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

  // Resetear lista ordenada al cambiar workers
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
                  {f.start && f.end ? `${f.start} - ${f.end}` : <em>Descanso</em>}
                </div>
              ));

              const breakInfo = filtered.length
                ? filtered[0].break_start && filtered[0].break_end
                  ? `${filtered[0].break_start} - ${filtered[0].break_end}`
                  : "—"
                : "—";

              // Obs del día seleccionado
              const scheduleObs = w.schedules.map((s) =>
                s.date === selectedDate ? s.obs || "" : ""
              );
              const hasObs = scheduleObs.some((obs) => obs !== "");

              const hasSupport = w.observation_1?.includes("APOYO");

              // === Asistencia con lógica Lima (corrimiento madrugada SOLO si earliest start <= umbral) ===
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
                      : hasSupport
                      ? "table-row-support"
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
                        ? "bg-green-400"
                        : attendance?.status === "Late"
                        ? "bg-orange-400"
                        : "bg-red-400"
                    }`}
                  >
                    {attendance?.status || "Absent"}
                  </td>
                  <td>{attendance?.check_in || ""}</td>
                  <td>{w.kustomer_email || "—"}</td>
                  <td>{scheduleObs}</td>
                  <td>
                    {`${hasSupport ? w.observation_1.split(" ").slice(0, 3).join(" ") : ""}`}
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
    </div>
  );
}
