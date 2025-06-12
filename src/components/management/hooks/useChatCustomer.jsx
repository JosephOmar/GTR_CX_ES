import { useState, useMemo } from 'react';
import { buildChatCustomerReport } from '../utils/ConcurrencyUtils';

export function useChatCustomer() {
  const [agentes, setAgentes] = useState('');
  const [bandejaActual, setBandejaActual] = useState('');
  const [snapcall, setSnapcall] = useState('');
  const [agentesNesting, setAgentesNesting] = useState('');
  const [nestingFull, setNestingFull] = useState('');
  const [nestingPart, setNestingPart] = useState('');
  const [cola, setCola] = useState('');

  const report = useMemo(
    () => buildChatCustomerReport({ agentes, bandejaActual, snapcall, agentesNesting, nestingFull, nestingPart, cola }),
    [agentes, bandejaActual, snapcall, agentesNesting, nestingFull, nestingPart, cola]
  );

  return { agentes, setAgentes, bandejaActual, setBandejaActual, snapcall, setSnapcall, agentesNesting, setAgentesNesting, nestingFull, setNestingFull, nestingPart, setNestingPart, cola, setCola, report };
}
