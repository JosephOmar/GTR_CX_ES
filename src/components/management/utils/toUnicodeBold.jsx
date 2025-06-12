export function toUnicodeBold(str) {
  const offsetUpper = 0x1D400 - 65; // A-Z
  const offsetLower = 0x1D41A - 97; // a-z
  const offsetNum   = 0x1D7CE - 48; // 0-9

  return str.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(code + offsetUpper);
    } else if (code >= 97 && code <= 122) {
      return String.fromCodePoint(code + offsetLower);
    } else if (code >= 48 && code <= 57) {
      return String.fromCodePoint(code + offsetNum);
    } else {
      return c; // keep other characters unchanged
    }
  }).join('');
}
