import React from "react";
import { getTodayDay } from "../utils/scheduleUtils";

export function TeamDayTimeFilter({
  teamFilter,
  setTeamFilter,
  selectedDate,
  setSelectedDate,
  timeFilter,
  setTimeFilter,
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
  const teamOptions = [
    { label: "All", value: "" },
    { label: "Chat Customer", value: "CHAT CUSTOMER" },
    { label: "Chat Rider", value: "CHAT RIDER" },
    { label: "Call Vendors", value: "CALL VENDORS" },
    { label: "Mail Vendors", value: "MAIL VENDORS" },
    { label: "Mail Rider", value: "MAIL RIDER" },
    { label: "Mail Customer / IS", value: "MAIL_CUSTOMER_GROUP" },
    { label: "Vendors (Call + Mail)", value: "VENDORS_GROUP" },
  ];
  const roleOptions = [
    { label: "All", value: "" },
    { label: "Agent", value: "AGENTE" },
    { label: "Supervisor", value: "SUPERVISOR" },
    { label: "Coordinator", value: "RESPONSABLE_GROUP" },
  ];

  const observation1Options = [
    { label: "All", value: "" },
    { label: "Regular", value: "REGULAR" },
    { label: "Migration", value: "MIGRACION" },
  ];

  const observation2Options = [
    { label: "All", value: "" },
    { label: "Mail User", value: "MAIL USER" },
  ];

  const timeSlots = [];
  for (let h = 0; h < 24; h++)
    ["00", "30"].forEach((m) =>
      timeSlots.push(`${String(h).padStart(2, "0")}:${m}`)
    );

  function formatDM(iso) {
  const [year, month, day] = iso.split("-");
  return `${day.padStart(2,"0")}/${month.padStart(2,"0")}`;
}

  return (
    <div className="w-[100vw]">
    <div className="w-[80%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label className="block mb-1">Filter by Obs 1:</label>
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
          <label className="block mb-1">Filter by Obs 2:</label>
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
      <div>
          <div className="flex items-center gap-4 mb-4">
            <label className="block mb-1">Filter by Date:</label>
            <button
              className="px-2 py-2 glovo-blue-accent text-white rounded"
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
                    ? "glovo-blue-accent text-white"
                    : "bg-gray-200"
                }`}
              >
                {formatDM(date)}
              </button>
            ))}
          </div>
        </div>
      <div>
        <div className="flex items-center gap-4 mb-4">
            <label className="block mb-1">Filter by Hour:</label>
            <button className="px-2 py-2 glovo-blue-accent text-white rounded" onClick={() => setTimeFilter('')}>Clean Hours</button>
        </div>        
        <div className="grid grid-cols-12 gap-2">
          {timeSlots.map((ts) => (
            <button
              key={ts}
              onClick={() => setTimeFilter(ts)}
              className={`px-2 py-2 text-center rounded ${
                timeFilter === ts ? "glovo-blue-accent text-white" : "bg-gray-200"
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
