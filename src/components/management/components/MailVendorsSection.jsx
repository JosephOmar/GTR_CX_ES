// File: src/components/MailVendorsSection.js
import React from 'react';
import NumericInput from '../utils/NumericInput';
import CopyButton from '../utils/CopyButton';
import { useMailSection } from '../hooks/useMailSection';
import { buildVendorsReport } from '../utils/mailReports';
import { toUnicodeBold } from '../utils/toUnicodeBold';

export function MailVendorsSection() {
  const {
    notAssigned,
    setNotAssigned,
    assigned,
    setAssigned,
    loLevel2,
    setLoLevel2,
    tier2Partner,
    setTier2Partner,
    mcDonaldsSpain,
    setMcDonaldsSpain,
    vencidosVendors,
    setVencidosVendors,
    porVencerVendors,
    setPorVencerVendors,
    porVencerHoursVendors,
    setPorVencerHoursVendors,
    report,
  } = useMailSection(
    [
      'notAssigned',
      'assigned',
      'loLevel2',
      'tier2Partner',
      'mcDonaldsSpain',
      'vencidosVendors',
      'porVencerVendors',
      'porVencerHoursVendors',
    ],
    buildVendorsReport
  );

  return (
    <section className="border p-4 rounded-lg">
      <h3 className="text-xl font-bold">✉️ Mail Vendors</h3>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput label="Emails Not Assigned:" value={notAssigned} setter={setNotAssigned} required placeholder="Ej: 956" />
        <NumericInput label="Emails Assigned:" value={assigned} setter={setAssigned} required placeholder="Ej: 115" />
        <NumericInput label="LO Level2 Partner:" value={loLevel2} setter={setLoLevel2} required placeholder="Ej: 776" />
        <NumericInput label="Tier2 Partner:" value={tier2Partner} setter={setTier2Partner} required placeholder="Ej: 41" />
        <NumericInput label="McDonalds Spain:" value={mcDonaldsSpain} setter={setMcDonaldsSpain} required placeholder="Ej: 313" />
        <NumericInput label="Vencidos:" value={vencidosVendors} setter={setVencidosVendors} required placeholder="Ej: 2" />
        <NumericInput label="Por Vencer:" value={porVencerVendors} setter={setPorVencerVendors} required placeholder="Ej: 125" />
        <NumericInput label="Horas para vencimiento:" value={porVencerHoursVendors} setter={setPorVencerHoursVendors} required placeholder="Ej: 9" />
      </div>
      <CopyButton text={report} />
    </section>
  )
}
