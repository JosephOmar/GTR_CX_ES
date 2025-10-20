export function getPlannedFor(team, timeZone = "Europe/Madrid") {
  try {
    const raw = localStorage.getItem("plannedData");
    if (!raw) return null;

    const planned = JSON.parse(raw);

    const formattedDate = new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());


    return planned.find(
      (p) =>
        p.team === team &&
        p.date === formattedDate 
    );
  } catch (e) {
    console.error("Error leyendo plannedData:", e);
    return null;
  }
}