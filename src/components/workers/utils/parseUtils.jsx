// Extrae nombres antes de "(DYLAT"
export function parseNames(text) {
  const regex = /^(.+?)\s*\(DYLAT/;
  return text
    .split('\n')
    .map(line => (line.match(regex) || [])[1])
    .filter(Boolean)
    .map(n => n.trim().toLowerCase());
}
