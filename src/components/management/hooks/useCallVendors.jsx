import { useState, useMemo } from 'react';
import { buildCallVendorsReport } from '../utils/ConcurrencyUtils';

export function useCallVendors() {
  const [enLlamada, setEnLlamada] = useState('');
  const [disponibles, setDisponibles] = useState('');
  const [enAuxiliar, setEnAuxiliar] = useState('');
  const [cola, setCola] = useState('');

  const report = useMemo(
    () => buildCallVendorsReport({ enLlamada, disponibles, enAuxiliar, cola }),
    [enLlamada, disponibles, enAuxiliar, cola]
  );

  return { enLlamada, setEnLlamada, disponibles, setDisponibles, enAuxiliar, setEnAuxiliar, cola, setCola, report };
}