import React, { useMemo, useState } from "react";
import { usePlannedData } from "../../management/hooks/usePlannedData";

/** Obtiene el offset de Madrid (en horas) para una fecha dada (YYYY-MM-DD).
 *  Ej.: "2025-10-13" -> 2 (horario de verano), "2025-12-01" -> 1.
 */
function getMadridOffsetHours(madridDate) {
  const probeUtcNoon = new Date(`${madridDate}T12:00:00Z`); // asegura el mismo día en Madrid
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    timeZoneName: "shortOffset",
  }).formatToParts(probeUtcNoon);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value || "GMT+1"; // p.ej. "GMT+2"
  const sign = tz.includes("+") ? 1 : -1;
  const hours = parseInt(tz.split(/[+-]/)[1], 10) || 0;
  return sign * hours;
}

/** Convierte una hora de intervalo de Madrid a hora y fecha de Perú.
 *  interval: "HH:MM-HH:MM" (usamos el inicio)
 *  return: { peruTime: "HH:MM", peruDate: "YYYY-MM-DD" }
 */
function madridIntervalToPeru(madridDate, interval) {
  if (!madridDate || !interval) return { peruTime: "", peruDate: "" };
  const [start] = interval.split("-");
  const [H, M] = start.split(":").map(Number);

  // Offset horario de Madrid para ese día
  const offsetH = getMadridOffsetHours(madridDate);

  // Construimos el instante UTC equivalente a la pared de Madrid (restando el offset)
  const utcMs = Date.UTC(
    Number(madridDate.slice(0, 4)),
    Number(madridDate.slice(5, 7)) - 1,
    Number(madridDate.slice(8, 10)),
    H - offsetH,
    M,
    0
  );
  const utcDate = new Date(utcMs);

  // Formateamos en Lima (hora y fecha)
  const peruTime = new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(utcDate);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(utcDate);
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  const d = parts.find((p) => p.type === "day").value;
  const peruDate = `${y}-${m}-${d}`;

  return { peruTime, peruDate };
}

/** Devuelve YYYY-MM-DD del "hoy" en Madrid */
function todayInMadrid() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  const d = parts.find((p) => p.type === "day").value;
  return `${y}-${m}-${d}`;
}

export default function PlannedDataTable() {
  const { plannedData, loading, error } = usePlannedData();

  // ❗ No uses new Date(date). Mantén el string tal cual (es fecha Madrid).
  const uniqueDates = useMemo(() => {
    const set = new Set(plannedData.map((r) => r.date).filter(Boolean));
    return Array.from(set).sort(); // ISO sort funciona cronológicamente
  }, [plannedData]);

  const uniqueTeams = useMemo(
    () => Array.from(new Set(plannedData.map((r) => r.team).filter(Boolean))),
    [plannedData]
  );

  // Por defecto: hoy (Madrid)
  const [selectedDate, setSelectedDate] = useState(todayInMadrid());
  const [selectedTeam, setSelectedTeam] = useState("");

  const filtered = useMemo(() => {
    return plannedData.filter((r) => {
      const okDate = selectedDate ? r.date === selectedDate : true; // r.date es fecha Madrid
      const okTeam = selectedTeam ? r.team === selectedTeam : true;
      return okDate && okTeam;
    });
  }, [plannedData, selectedDate, selectedTeam]);

  if (loading) return <p>Cargando…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>📊 Forecast vs. Real</h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <label>
          📅 Fecha (Spain):{" "}
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {/* Opción “hoy Madrid” al inicio si existe en data */}
            {!uniqueDates.includes(selectedDate) && (
              <option value={selectedDate}>
                {new Intl.DateTimeFormat("es-ES").format(
                  new Date(`${selectedDate}T00:00:00`)
                )}{" "}
                (hoy Madrid)
              </option>
            )}
            <option value="">Todas</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>
                {
                  // Mostrar como DD/MM/YYYY sin cambiar el día
                  new Intl.DateTimeFormat("es-ES", {
                    timeZone: "Europe/Madrid",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(new Date(`${d}T12:00:00Z`)) // usar noon UTC para evitar corrimientos visuales
                }
              </option>
            ))}
          </select>
        </label>

        <label>
          👥 Team:{" "}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">Todos</option>
            {uniqueTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
        }}
      >
        <thead style={{ background: "#f3f3f3" }}>
          <tr>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Team</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Perú Time</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Spain Time</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Client Required Hrs</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Total Scheduled Hrs</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Dsv Scheduled</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>Contact Forecast</th>
            <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>THT</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => {
            const { peruTime } = madridIntervalToPeru(r.date, r.interval);
            const diff = (r.scheduled_agents ?? 0) - (r.required_agents ?? 0);

            return (
              <tr key={`${r.team}-${r.date}-${r.interval}-${i}`}>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{r.team}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{peruTime}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{r.interval}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{r.required_agents}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{r.scheduled_agents}</td>
                <td
                  style={{
                    padding: 6,
                    borderBottom: "1px solid #eee",
                    fontWeight: "bold",
                    color: diff < 0 ? "red" : diff > 0 ? "green" : "inherit",
                  }}
                >
                  {diff}
                </td>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{r.forecast_received}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #eee" }}>{r.forecast_tht}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p style={{ marginTop: 8 }}>No hay datos para los filtros seleccionados.</p>
      )}
    </div>
  );
}
