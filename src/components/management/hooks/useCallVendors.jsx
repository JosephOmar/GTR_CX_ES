import { useState, useMemo } from 'react';
import { buildCallVendorsReport } from '../utils/ConcurrencyUtils';

export function useCallVendors() {
  const [agentes, setAgentes] = useState('');
  const [disponibles, setDisponibles] = useState('');
  const [enAuxiliar, setEnAuxiliar] = useState('');
  const [cola, setCola] = useState('');

  const report = useMemo(
    () => buildCallVendorsReport({ agentes, disponibles, enAuxiliar, cola }),
    [agentes, disponibles, enAuxiliar, cola]
  );

  return { agentes, setAgentes, disponibles, setDisponibles, enAuxiliar, setEnAuxiliar, cola, setCola, report };
}