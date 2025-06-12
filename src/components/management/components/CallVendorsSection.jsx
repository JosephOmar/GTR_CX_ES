import React from 'react';
import NumericInput from '../utils/NumericInput';
import CopyButton from '../utils/CopyButton';
import { useCallVendors } from '../hooks/useCallVendors';
import { toUnicodeBold } from '../utils/toUnicodeBold';

export function CallVendorsSection() {
  const { enLlamada, setEnLlamada, disponibles, setDisponibles, enAuxiliar, setEnAuxiliar, cola, setCola, report } = useCallVendors();

  return (
    <section className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">{toUnicodeBold('📞 Call Vendors')}</h2>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput label="Agentes en llamada:" value={enLlamada} setter={setEnLlamada} placeholder="Ej: 20" />
        <NumericInput label="Asesores disponibles:" value={disponibles} setter={setDisponibles} placeholder="Ej: 25" />
        <NumericInput label="As en auxiliar:" value={enAuxiliar} setter={setEnAuxiliar} placeholder="Ej: 4" />
        <NumericInput label="Llamadas en cola:" value={cola} setter={setCola} placeholder="Ej: 0" />
      </div>
      <CopyButton text={report} />
    </section>
  )
}