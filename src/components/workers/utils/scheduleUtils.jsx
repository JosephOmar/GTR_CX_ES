const DAYS = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];

// day de hoy
export function getTodayDay() {
  return DAYS[new Date().getDay()];
}

// "HH:MM" → minutos desde medianoche
export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// ¿superpone fragmento [start,end) con ventana de 30m?
export function inWindow(fragment, selectedDay, selectedTime) {
  if (fragment.day !== selectedDay) return false;
  if (!fragment.start || !fragment.end) return false;
  const ws = toMinutes(selectedTime), we = ws + 30;
  const s  = toMinutes(fragment.start);
  const e  = fragment.end === '24:00' ? 1440 : toMinutes(fragment.end);
  return s < we && e > ws;
}

// expande turnos que cruzan la medianoche
export function expandOvernight(turns) {
  return turns.flatMap(t => {
    const st = t.start_time?.slice(0,5);
    const et = t.end_time?.slice(0,5);
    if (!st || !et || st <= et) {
      return [{ day: t.day, start: st, end: et }];
    }
    const idx     = DAYS.indexOf(t.day);
    const nextDay = DAYS[(idx + 1) % 7];
    return [
      { day: t.day,      start: st,      end: '24:00' },
      { day: nextDay,    start: '00:00', end: et       },
    ];
  });
}
