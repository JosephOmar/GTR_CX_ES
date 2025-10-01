export function parseNames(text) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => {
      // Ignorar basura conocida
      if (/^(lo_whl|bullet|available|short break|long break|voice|in progress|on hold|acw|search|tlive| filter_list)$/i.test(line)) return false;
      if (/^\d{2}:\d{2}$/.test(line)) return false; // tiempos
      if (/^Ø$/.test(line)) return false;           // la letra sola
      if (/^\d+$/.test(line)) return false;         // IDs
      return true;
    })
    .filter(line => {
      // Que parezca nombre: al menos 2 palabras o un pegado NombreApellido
      return (
        /\s/.test(line) || /[a-záéíóúüñ][A-ZÁÉÍÓÚÑ]/.test(line)
      );
    })
    .map(n =>
      n
        .replace(/([a-záéíóúüñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2") // separa NombreApellido
        .toLowerCase()
    );
}
