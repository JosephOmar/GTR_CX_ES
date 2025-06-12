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