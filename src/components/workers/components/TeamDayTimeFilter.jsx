import React from "react";
import { getTodayDay } from "../utils/scheduleUtils";

export function TeamDayTimeFilter({
  statusFilter,
  setStatusFilter,
  teamFilter,
  setTeamFilter,
  selectedDate,
  setSelectedDate,
  timeFilter,
  setTimeFilter,
  exactStart,
  setExactStart,
  roleFilter,
  setRoleFilter,
  observation1Filter,
  setObservation1Filter,
  observation2Filter,
  setObservation2Filter,
  availableDates,
}) {
  const DAYS = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ];
  const dayOptions = DAYS.map((d) => ({
    label: d === getTodayDay() ? `${d} (Hoy)` : d,
    value: d,
  }));

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Actives", value: "ACTIVO" },
    { label: "Inactives", value: "INACTIVO" },   
    { label: "Vacation", value: "VACACIONES" },
  ]

  const teamOptions = [
    { label: "All", value: "" },
    { label: "Customer Tier 1", value: "CUSTOMER TIER 1" },
    { label: "Customer Tier 2", value: "CUSTOMER TIER 2" },
    { label: "Rider Tier 1", value: "RIDER TIER 1" },
    { label: "Rider Tier 2", value: "RIDER TIER 2" },
    { label: "Vendor Tier 1", value: "VENDOR TIER 1" },
    { label: "Vendor Tier 2", value: "VENDOR TIER 2" },
    { label: "Vendor Call", value: "VENDOR CALL" },
    { label: "Vendor Mail", value: "VENDOR MAIL" },
  ];

  const roleOptions = [
    { label: "All", value: "" },
    { label: "Agent", value: "AGENT" },
    { label: "Supervisor", value: "SUPERVISOR" },
    { label: "Coordinator", value: "COORDINATOR" },
  ];

  const observation1Options = [
    { label: "All", value: "" },
    { label: "Part-Time", value: "PART TIME" },
    { label: "Full-Time", value: "FULL TIME" },
    { label: "Concentrix", value: "CONCENTRIX" },
    { label: "Ubycall", value: "UBYCALL" },
  ];

  const observation2Options = [
    { label: "All", value: "" },
    { label: "Mail User", value: "MAIL USER" },
    { label: "Mail Rider", value: "MAIL RIDER" },
  ];

  const timeSlots = [];
  for (let h = 0; h < 24; h++)
    ["00", "30"].forEach((m) =>
      timeSlots.push(`${String(h).padStart(2, "0")}:${m}`)
    );

  function formatDM(iso) {
    const [year, month, day] = iso.split("-");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}`;
  }

  const handleTimeClick = (timeSlot) => {
    setTimeFilter((prev) => {
      // Si el tiempo ya está seleccionado, lo eliminamos
      if (prev.includes(timeSlot)) {
        return prev.filter((t) => t !== timeSlot);
      }

      // Si no está seleccionado y hay menos de 2 elementos, lo añadimos
      if (prev.length < 2) {
        return [...prev, timeSlot];
      }

      // Si hay más de 2 elementos, eliminamos el primero y añadimos el nuevo
      return [...prev.slice(1), timeSlot];
    });
  };

  return (
    <div className="w-[100vw]">
      <div className="w-[80%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className=" col-span-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filtros de equipo, rol, observaciones */}
          <div>
            <label className="block mb-1">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border-gray-300 rounded px-2 py-1 "
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Filter by Team:</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full border-gray-300 rounded px-2 py-1 "
            >
              {teamOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Filter by Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border-gray-300 rounded px-2 py-1 "
            >
              {roleOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Filter by Contract:</label>
            <select
              value={observation1Filter}
              onChange={(e) => setObservation1Filter(e.target.value)}
              className="w-full border-gray-300 rounded px-2 py-1 "
            >
              {observation1Options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Filter by Support:</label>
            <select
              value={observation2Filter}
              onChange={(e) => setObservation2Filter(e.target.value)}
              className="w-full border-gray-300 rounded px-2 py-1 "
            >
              {observation2Options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros de fecha */}
        <div className="col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <label className="block mb-1">Filter by Date:</label>
            <button
              className="px-2 py-2 text-white rounded"
              onClick={() => setSelectedDate("")}
            >
              Clean Dates
            </button>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-2 py-2 text-center rounded ${
                  selectedDate === date
                    ? "bg-primary-hover text-white"
                    : ""
                }`}
              >
                {formatDM(date)}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros de hora */}
        <div className="lg:col-span-2 col-span-1 w-[50%] sm:min-w-[680px] min-w-[100%] mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <label className="block mb-1">Filter by Hour:</label>
            <button
              className="px-2 py-2 text-white rounded"
              onClick={() => setTimeFilter([])} // Limpiar selección de horas
            >
              Clean Hours
            </button>
            <button
              className={`px-2 py-2 rounded text-white ${
                exactStart ? "bg-purple-600" : "bg-gray-500"
              }`}
              onClick={() => setExactStart((prev) => !prev)}
            >
              {exactStart ? "Inicio exacto" : "Rango"}
            </button>
          </div>
          <div className="grid sm:grid-cols-12 grid-cols-6 gap-2">
            {timeSlots.map((ts) => (
              <button
                key={ts}
                onClick={() => handleTimeClick(ts)}
                className={`px-2 py-2 text-center rounded ${
                  timeFilter.includes(ts)
                    ? "bg-primary-hover text-white"
                    : ""
                }`}
              >
                {ts}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
