import React from 'react';
import NumericInput from '../utils/NumericInput';
import CopyButton from '../utils/CopyButton';
import { useChatCustomer } from '../hooks/useChatCustomer';
import { toUnicodeBold } from '../utils/toUnicodeBold';

export function ChatCustomerSection() {
  const { agentes, setAgentes, bandejaActual, setBandejaActual, snapcall, setSnapcall, agentesNesting, setAgentesNesting, nestingFull, setNestingFull, nestingPart, setNestingPart, cola, setCola, report } = useChatCustomer();

  return (
    <section className="border p-4 rounded-lg">
      <h3 className="text-xl font-bold">💬 Chat Customer</h3>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput label="Agentes:" value={agentes} setter={setAgentes} required placeholder="Ej: 69" />
        <NumericInput label="Bandeja Actual:" value={bandejaActual} setter={setBandejaActual} required placeholder="Ej: 97" />
        <NumericInput label="Snapcall:" value={snapcall} setter={setSnapcall} placeholder="Ej: 2" />
        <NumericInput label="Agentes Nesting:" value={agentesNesting} setter={setAgentesNesting} placeholder="Ej: 4" />
        <NumericInput label="Nesting Full:" value={nestingFull} setter={setNestingFull} placeholder="Ej: 2" />
        <NumericInput label="Nesting Part:" value={nestingPart} setter={setNestingPart} placeholder="Ej: 2" />
        <NumericInput label="Cola:" value={cola} setter={setCola} placeholder="Ej: 3" />
      </div>
      <CopyButton text={report} />
    </section>
);}