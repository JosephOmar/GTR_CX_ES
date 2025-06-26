// utils/time.ts
export function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ['00','30']) {
      const hh = h.toString().padStart(2,'0');
      times.push(`${hh}:${m}`);
    }
  }
  return times;
}

export const getMadridToPeruTime = (lastTime: string): string => {
  // Obtener la fecha actual y comprobar si Madrid está en horario de verano
  const currentDate = new Date();

  // Función para comprobar si Madrid está en horario de verano
  const isDST = (date: Date) => {
    const startDST = new Date(date.getFullYear(), 2, 31); // Marzo 31
    const endDST = new Date(date.getFullYear(), 9, 31); // Octubre 31

    startDST.setDate(startDST.getDate() - startDST.getDay()); // Último domingo de marzo
    endDST.setDate(endDST.getDate() - endDST.getDay()); // Último domingo de octubre

    return date >= startDST && date <= endDST;
  };

  // Determinar si estamos en horario de verano o estándar en Madrid
  const isMadridDST = isDST(currentDate);
  const offsetMadrid = isMadridDST ? 2 : 1; // 2 horas si está en horario de verano, 1 si no lo está
  const offsetPeru = -5; // Perú está en GMT-5 todo el año

  // Calcular la diferencia horaria entre Madrid y Perú
  const timeDifference = offsetMadrid - offsetPeru;

  // Convertir la hora de Madrid a la hora de Perú (restando la diferencia)
  const [h, m] = lastTime.split(":").map(Number);
  const dt = new Date();
  dt.setHours(h - timeDifference, m); // Restamos la diferencia horaria
  return dt.toTimeString().slice(0, 5); // "06:30" o "07:30"
};
