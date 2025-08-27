export function getRoundedDisplayTime(date = new Date()) {
  let hour = date.getHours();
  const minute = date.getMinutes();
  let displayHour, displayMinute;
  if (minute >= 59) {
    displayHour = hour;
    displayMinute = 59;
  } else if (minute >= 29) {
    displayHour = hour;
    displayMinute = 29;
  } else {
    displayHour = hour - 1;
    displayMinute = 59;
  }
  if (displayHour < 0) displayHour = 23;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(displayHour)}:${pad(displayMinute)}`;
}

export function getHourStartTime(date = new Date()) {
  const hour = date.getHours();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hour)}:00`;
}

export function getRoundedDisplayTimeSpain(date = new Date()) {
  // Convertir la fecha a la hora de España (Madrid)
  const dateInSpain = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));

  let hour = dateInSpain.getHours();
  const minute = dateInSpain.getMinutes();
  let displayHour, displayMinute;
  
  if (minute >= 59) {
    displayHour = hour;
    displayMinute = 59;
  } else {
    displayHour = hour - 1;
    displayMinute = 59;
  }
  
  if (displayHour < 0) displayHour = 23;
  
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(displayHour)}:${pad(displayMinute)}`;
}

export function getHourStartTimeSpain(date = new Date()) {
  // Convertir la fecha a la hora de España (Madrid)
  const dateInSpain = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));

  let hour = dateInSpain.getHours() - 1;
  if (hour == -1 ) { hour = 23} 
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hour)}:00`;
}

export function getRoundedDisplayTimePortugal(date = new Date()) {
  // Convertir la fecha a la hora de Portugal (Lisboa)
  const dateInPortugal = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));

  let hour = dateInPortugal.getHours();
  const minute = dateInPortugal.getMinutes();
  let displayHour, displayMinute;
  
  if (minute >= 59) {
    displayHour = hour;
    displayMinute = 59;
  } else {
    displayHour = hour - 1;
    displayMinute = 59;
  }
  
  if (displayHour < 0) displayHour = 23;
  
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(displayHour)}:${pad(displayMinute)}`;
}

export function getHourStartTimePortugal(date = new Date()) {
  // Convertir la fecha a la hora de Portugal (Lisboa)
  const dateInPortugal = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));

  let hour = dateInPortugal.getHours() - 1;
  if (hour === -1) hour = 23;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hour)}:00`;
}
