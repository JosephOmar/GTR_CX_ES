// File: src/components/MailCustomerSection.js
import React from 'react';
import NumericInput from '../utils/NumericInput';
import CopyButton from '../utils/CopyButton';
import { useMailSection } from '../hooks/useMailSection';
import { buildCustomerReport } from '../utils/mailReports';
import { toUnicodeBold } from '../utils/toUnicodeBold';

export function MailCustomerSection() {
  const {
    loEsAdCustomer,
    setLoEsAdCustomer,
    severeIncidences,
    setSevereIncidences,
    partialRefunds,
    setPartialRefunds,
    reclamosES,
    setReclamosES,
    vencidosCustomer,
    setVencidosCustomer,
    porVencerCustomer,
    setPorVencerCustomer,
    porVencerHoursCustomer,
    setPorVencerHoursCustomer,
    report,
  } = useMailSection(
    [
      'loEsAdCustomer',
      'severeIncidences',
      'partialRefunds',
      'reclamosES',
      'vencidosCustomer',
      'porVencerCustomer',
      'porVencerHoursCustomer',
    ],
    buildCustomerReport
  );

  return (
    <section className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">{toUnicodeBold('✉️ Mail Customer')}</h2>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput label="LO ES/AD Customer:" value={loEsAdCustomer} setter={setLoEsAdCustomer} required placeholder="Ej: 123" />
        <NumericInput label="Severe Incidences:" value={severeIncidences} setter={setSevereIncidences} required placeholder="Ej: 32" />
        <NumericInput label="Partial Refunds:" value={partialRefunds} setter={setPartialRefunds} required placeholder="Ej: 21" />
        <NumericInput label="Reclamos ES:" value={reclamosES} setter={setReclamosES} required placeholder="Ej: 0" />
        <NumericInput label="Vencidos:" value={vencidosCustomer} setter={setVencidosCustomer} required placeholder="Ej: 12" />
        <NumericInput label="Por Vencer:" value={porVencerCustomer} setter={setPorVencerCustomer} required placeholder="Ej: 12" />
        <NumericInput label="Horas para vencimiento:" value={porVencerHoursCustomer} setter={setPorVencerHoursCustomer} required placeholder="Ej: 6" />
      </div>
      <CopyButton text={report} />
    </section>
  );
}