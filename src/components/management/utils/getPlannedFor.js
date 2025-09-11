function getTodayForInterval(hourStart, timeZone) {
  const now = new Date();

  // 📌 Fecha en la zona horaria deseada
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // 📌 Hora en la zona horaria deseada (00–23)
  const hourFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hour12: false,
  });

  const currentHourInTZ = parseInt(hourFormatter.format(now), 10);

  // Fecha base en la zona horaria
  let dateToUse = new Date(
    dateFormatter.format(now) + "T00:00:00"
  );

  // ⚠️ Ajuste especial: si pedimos 23:00 y ya pasó medianoche en esa zona
  if (hourStart === "23:00" && currentHourInTZ < 23) {
    dateToUse.setDate(dateToUse.getDate() - 1);
  }

  return dateFormatter.format(dateToUse);
}


export function getPlannedFor(team, hourStart, timeZone = "Europe/Madrid") {
  try {
    const raw = localStorage.getItem("plannedData");
    if (!raw) return null;

    const planned = JSON.parse(raw);

    const date = getTodayForInterval(hourStart, timeZone);
    console.log(`${hourStart}, ${date}`)
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