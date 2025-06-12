// File: src/components/MailRiderSection.js
import React from 'react';
import NumericInput from '../utils/NumericInput';
import CopyButton from '../utils/CopyButton';
import { useMailSection } from '../hooks/useMailSection';
import { buildRiderReport } from '../utils/mailReports';
import { toUnicodeBold } from '../utils/toUnicodeBold';

export function MailRiderSection() {
  const {
    loEsAdRider,
    setLoEsAdRider,
    vencidosRider,
    setVencidosRider,
    porVencerRider,
    setPorVencerRider,
    porVencerHoursRider,
    setPorVencerHoursRider,
    agentsRider,
    setAgentsRider,
    report,
  } = useMailSection(
    ['loEsAdRider', 'vencidosRider', 'porVencerRider', 'porVencerHoursRider', 'agentsRider'],
    buildRiderReport
  );

  return (
    <section className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">{toUnicodeBold('✉️ Mail Rider')}</h2>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput label="LO ES/AD Glover Emails:" value={loEsAdRider} setter={setLoEsAdRider} required placeholder="Ej: 123" />
        <NumericInput label="Vencidos:" value={vencidosRider} setter={setVencidosRider} required placeholder="Ej: 2" />
        <NumericInput label="Por Vencer:" value={porVencerRider} setter={setPorVencerRider} required placeholder="Ej: 3" />
        <NumericInput label="Horas para vencimiento:" value={porVencerHoursRider} setter={setPorVencerHoursRider} required placeholder="Ej: 11" />
        <NumericInput label="Agentes:" value={agentsRider} setter={setAgentsRider} required placeholder="Ej: 2" />
      </div>
      <CopyButton text={report} />
    </section>
  )
}