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
  attendanceFilter,
  setAttendanceFilter,
  availableDates,
}) {
  const statusOptions = [
    { label: "All", value: "" },
    { label: "Actives", value: "ACTIVO" },
    { label: "Inactives", value: "INACTIVO" },
    { label: "Vacation", value: "VACACIONES" },
  ];

  const teamOptions = [
    { label: "Customer Tier1", value: "CUSTOMER TIER1" },
    { label: "Customer Tier2", value: "CUSTOMER TIER2" },
    { label: "Rider Tier1", value: "RIDER TIER1" },
    { label: "Rider Tier2", value: "RIDER TIER2" },
    { label: "Vendor Tier1", value: "VENDOR TIER1" },
    { label: "Vendor Tier2", value: "VENDOR TIER2" },
    { label: "All HC", value: "All HC" },
  ];

  const roleOptions = [
    { label: "All", value: "" },
    { label: "Agent", value: "AGENT" },
    { label: "Supervisor", value: "SUPERVISOR" },
    { label: "Coordinator", value: "COORDINATOR" },
    { label: "Training", value: "TRAINING" },
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
    { label: "Productive", value: "productive" },
    { label: "Unproductive", value: "unproductive" },
  ];

  const attendanceOptions = [
    { label: "All", value: "" },
    { label: "Present", value: "Present" },
    { label: "Late", value: "Late" },
    { label: "Absent", value: "Absent" },
  ];

  // ¿Hay selección en Team?
  const isTeamEmpty = Array.isArray(teamFilter)
    ? teamFilter.length === 0
    : !teamFilter;

  // ¿Algún filtro distinto al estado "limpio"?
  const isDirty = Boolean(
    statusFilter ||
      roleFilter ||
      observation1Filter ||
      observation2Filter ||
      attendanceFilter ||
      selectedDate ||
      exactStart ||
      (timeFilter && timeFilter.length > 0) ||
      !isTeamEmpty
  );

  // Limpia todos los filtros a sus valores "All"/vacíos
  const handleClearAll = () => {
    setStatusFilter("");
    setTeamFilter([]); // multiselección vacía
    setRoleFilter("");
    setObservation1Filter("");
    setObservation2Filter("");
    setAttendanceFilter("");
    setSelectedDate(""); // sin fecha
    setTimeFilter([]); // sin horas
    setExactStart(false); // modo rango por defecto (ajústalo si tu default es true)
  };

  const handleTeamChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value)
      // Evita guardar la opción "All" (valor vacío) cuando hay selección múltiple
      .filter((v) => v !== "");
    setTeamFilter(values);
  };

  const timeSlots = [];
  for (let h = 0; h < 24; h++)
    ["00", "30"].forEach((m) =>
      timeSlots.push(`${String(h).padStart(2, "0")}:${m}`)
    );

  function formatDM(iso) {
    if (!iso) return ""; // retorna vacío si iso es null/undefined

    const parts = iso.split("-");
    if (parts.length < 3) return iso; // si no tiene el formato esperado, devuelves el valor tal cual

    const [year, month, day] = parts;
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
              multiple
              value={
                Array.isArray(teamFilter)
                  ? teamFilter
                  : teamFilter
                  ? [teamFilter]
                  : []
              }
              onChange={handleTeamChange}
              className="w-full border-gray-300 rounded px-2 py-1 min-h-[130px]"
            >
              <option value="">All</option>
              {teamOptions
                .filter((o) => o.value !== "") // evitamos duplicar "All"
                .map((o) => (
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
            <label className="block mb-1">Filter by Productive:</label>
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
          <div>
            <label className="block mb-1">Filter by Attendance:</label>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="w-full border-gray-300 rounded px-2 py-1 "
            >
              {attendanceOptions.map((o) => (
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
                  selectedDate === date ? "bg-primary-hover text-white" : ""
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
              {exactStart ? "Rango" : "Inicio exacto"}
            </button>
            <div className="lg:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={handleClearAll}
                disabled={!isDirty}
                title="Limpiar todos los filtros"
                className="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 
                   disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Limpiar todos los filtros
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-12 grid-cols-6 gap-2">
            {timeSlots.map((ts) => (
              <button
                key={ts}
                onClick={() => handleTimeClick(ts)}
                className={`px-2 py-2 text-center rounded ${
                  timeFilter.includes(ts) ? "bg-primary-hover text-white" : ""
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
