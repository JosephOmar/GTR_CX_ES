const DAYS = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];

// day de hoy
export function getTodayDay() {
  return new Date().getDay();
}

export function getStringDays() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  return {todayStr, yesterdayStr}
}

// "HH:MM" → minutos desde medianoche
export function toMinutes(hhmm) {
  if (typeof hhmm !== 'string') {
    console.warn('toMinutes recibió un valor inválido:', hhmm);
    return 0; // o lanza un error controlado
  }
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// ¿superpone fragmento [start,end) con ventana de 30m?
export function inWindow(fragment, selectedDate, selectedTime) {
  if (fragment.date !== selectedDate) return false

  // 2. Convertimos a minutos
  const ws = toMinutes(selectedTime)        // window start
  const we = ws + 30                        // window end

  const s = toMinutes(fragment.start)       // fragment start
  const e =
    fragment.end === "24:00"
      ? 1440
      : toMinutes(fragment.end)

  // 3. Chequeo de solapamiento
  return s < we && e > ws
}

function addDaysISO(isoDate, n) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  // formatea de vuelta a 'YYYY-MM-DD'
  return dt.toISOString().slice(0, 10);
}

export function expandOvernight(turns) {
  return turns?.flatMap(t => {
    // st = "HH:MM", et = "HH:MM"
    const st = t.start_time?.slice(0, 5);
    const et = t.end_time?.slice(0, 5);
    const breakStart = t.break_start?.slice(0, 5);  // Suponiendo que break_start está en el objeto
    const breakEnd = t.break_end?.slice(0, 5);      // Suponiendo que break_end está en el objeto

    if (!st || !et) return [];

    if (st <= et) {
      // mismo día
      return [{ date: t.date, start: st, end: et, break_start: breakStart, break_end: breakEnd }];
    }
    // cruza medianoche
    const nextDate = addDaysISO(t.date, 1);
    return [
      { date: t.date, start: st, end: "24:00", break_start: breakStart, break_end: breakEnd },
      { date: nextDate, start: "00:00", end: et, break_start: breakStart, break_end: breakEnd },
    ];
  });
}


