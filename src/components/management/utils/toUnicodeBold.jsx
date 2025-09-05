export function toUnicodeBold(str) {
  const offsetUpper = 0x1D400 - 65; // A-Z
  const offsetLower = 0x1D41A - 97; // a-z
  const offsetNum = 0x1D7CE - 48;   // 0-9

  const combiningAccent = '\u0301'; // acento agudo

  // Manejo especial para ñ y Ñ (no existen en Unicode Math Bold)
  const specialMap = {
    'ñ': '𝗻' + combiningAccent, // como workaround visual
    'Ñ': '𝗡' + combiningAccent
  };

  return str.normalize('NFD') // separa letras y tildes
    .split('')
    .map(c => {
      if (specialMap[c]) {
        return specialMap[c];
      }
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(code + offsetUpper);
      } else if (code >= 97 && code <= 122) {
        return String.fromCodePoint(code + offsetLower);
      } else if (code >= 48 && code <= 57) {
        return String.fromCodePoint(code + offsetNum);
      } else if (c === '\u0301') { // tilde combinante
        return combiningAccent;
      } else {
        return c;
      }
    }).join('');
}
