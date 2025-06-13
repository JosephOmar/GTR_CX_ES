const DAYS = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];

// day de hoy
export function getTodayDay() {
  return DAYS[new Date().getDay()];
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
export function inWindow(fragment, selectedDay, selectedTime) {
  if (fragment.day !== selectedDay) return false;
  if (!fragment.start || !fragment.end) return false;
  const ws = toMinutes(selectedTime), we = ws + 30;
  const s  = toMinutes(fragment.start);
  const e  = fragment.end === '24:00' ? 1440 : toMinutes(fragment.end);
  return s < we && e > ws;
}

export function expandOvernight(turns) {
  return turns.flatMap(t => {
    const st = t.start_time?.slice(0,5);
    const et = t.end_time?.slice(0,5);

    // turno normal o datos incompletos
    if (!st || !et || st <= et) {
      return [{ day: t.day, start: st, end: et }];
    }

    const idx     = DAYS.indexOf(t.day);
    const prevDay = DAYS[(idx - 1 + 7) % 7];
    const nextDay = DAYS[(idx + 1) % 7];

    const expanded = [
      { day: t.day,      start: st,  end: '24:00' },
      { day: nextDay,    start: '00:00', end: et     },
    ];

    // // buscamos el turno del día anterior
    // const prevTurn = turns.find(turn => turn.day === prevDay);

    // // extraemos y validamos las cadenas antes de convertir
    // const prevSt = prevTurn?.start_time?.slice(0,5);
    // const prevEt = prevTurn?.end_time?.slice(0,5);

    // if (
    //   prevSt &&
    //   prevEt &&
    //   toMinutes(prevEt) < toMinutes(prevSt)
    // ) {
    //   expanded.unshift({
    //     day: prevDay,
    //     start: '00:00',
    //     end: prevEt,
    //   });
    // }

    return expanded;
  });
}

