import { useState, useMemo } from 'react';

export function useMailSection(initialKeys, buildReport) {
  // Un solo estado para todas las claves
  const [state, setState] = useState(
    initialKeys.reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {})
  );

  // Setters dinámicos que actualizan solo la clave necesaria
  const setters = {};
  initialKeys.forEach((key) => {
    setters[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] = (value) =>
      setState((prev) => ({
        ...prev,
        [key]: value,
      }));
  });

  // Memoizamos el reporte para que solo se recalculen cambios reales
  const report = useMemo(() => buildReport(state), [state, buildReport]);

  return { ...state, ...setters, report };
}
