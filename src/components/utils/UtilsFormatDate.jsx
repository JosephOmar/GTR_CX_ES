import { expandOvernight } from "../workers/utils/scheduleUtils";

// ! Fecha y Minutos en TZ Lima
export const getNowInTZ = (timeZone) => {
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

// ! Hora (HH:MM) a minutos
export const parseTimeToMinutes = (str) => {
  if (!str) return null;
  const [h, m] = str.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};

// ! Calcula de día anterior, uso de UTC para evitar errores.
export const prevDateStr = (iso) => {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

// ! Valida inicio de turno, solo aplica para los que inician a las 00:00
const ALLOWED_OVERNIGHT_START_MINUTES = 0;
export const startsWithinOvernightThreshold = (turns) => {
  const mins = turns
    .map((s) => parseTimeToMinutes(s.start))
    .filter((v) => Number.isFinite(v));
  if (!mins.length) return false;
  const earliest = Math.min(...mins);
  return earliest <= ALLOWED_OVERNIGHT_START_MINUTES;
};

// ! Elige la fecha anterior para aquellos que inicien a las 00:00, solo hasta las 09:00 am
const TIMEZONE = "America/Lima";
const CUTOFF_MINUTES = 9 * 60;
const { date: todayISO_Lima, minutes: nowMinutes_Lima } = getNowInTZ(TIMEZONE);
export const chooseAttendanceDate = (selectedDate, turns) => {
  const isTodayInLima = selectedDate === todayISO_Lima;
  if (
    isTodayInLima &&
    nowMinutes_Lima < CUTOFF_MINUTES &&
    startsWithinOvernightThreshold(turns)
  ) {
    return prevDateStr(selectedDate);
  }
  return selectedDate;
};

// ! Obtiene los turnos del día considerando solo el día actual (Desde las 00:00)
export const getTurnsForWorker = (worker, selectedDate) => {
  const schedules =
    worker.contract_type?.name === "UBYCALL"
      ? worker.ubycall_schedules
      : worker.schedules;

  return expandOvernight(schedules).filter((f) => f.start_date === selectedDate);
};

// ! Transforma a minutos la hora de inicio de los turnos
export const getStartMinutes = (worker, selectedDate) => {
  const turns = getTurnsForWorker(worker, selectedDate);
  if (!turns) return Infinity;
  const start = turns.length
    ? Math.min(...turns.map((f) => parseTimeToMinutes(f.start)))
    : Infinity;

  return start;
};

// ! Asigna y obtiene un orden de prioridad
export const getAttendancePriority = (worker, effDate) => {
  const att = worker.attendances?.find((att) => att.date === effDate);
  const status = att?.status || "";
  
  const priority = { Present: 1, Late: 2, Absent: 3, "": 4 };
  return priority[status] ?? 99;
};
