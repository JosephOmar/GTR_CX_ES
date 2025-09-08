function getTodayForInterval(hourStart, timeZone) {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone })
  );

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  let dateToUse = now;

  // ⚠️ Ajuste de 23:00 -> retroceder un día si ya pasó medianoche
  if (hourStart === "23:00" && now.getHours() < 23) {
    dateToUse = new Date(dateToUse);
    dateToUse.setDate(dateToUse.getDate() - 1);
  }

  return formatter.format(dateToUse);
}

export function getPlannedFor(team, hourStart, timeZone = "Europe/Madrid") {
  try {
    const raw = localStorage.getItem("plannedData");
    if (!raw) return null;

    const planned = JSON.parse(raw);

    const date = getTodayForInterval(hourStart, timeZone);

    return planned.find(
      (p) =>
        p.team === team &&
        p.date === date &&
        p.interval === hourStart
    );
  } catch (e) {
    console.error("Error leyendo plannedData:", e);
    return null;
  }
}