import { useState, useMemo } from 'react';

export function useMailSection(initialKeys, buildReport) {
  const state = {};
  const setters = {};

  initialKeys.forEach((key) => {
    const [value, setter] = useState('');
    state[key] = value;
    setters[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] = setter;
  });

  const report = useMemo(() => buildReport(state), [state, buildReport]);

  return { ...state, ...setters, report };
}
