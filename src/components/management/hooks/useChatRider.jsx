import { useState, useMemo } from 'react';
import { buildChatRiderReport } from '../utils/ConcurrencyUtils';

export function useChatRider() {
  const [agentes, setAgentes] = useState('');
  const [bandejaActual, setBandejaActual] = useState('');
  const [agentesNesting, setAgentesNesting] = useState('');
  const [bandejaNesting, setBandejaNesting] = useState('');
  const [cola, setCola] = useState('');

  const report = useMemo(
    () => buildChatRiderReport({ agentes, bandejaActual, agentesNesting, bandejaNesting, cola }),
    [agentes, bandejaActual, agentesNesting, bandejaNesting, cola]
  );

  return { agentes, setAgentes, bandejaActual, setBandejaActual, agentesNesting, setAgentesNesting, bandejaNesting, setBandejaNesting, cola, setCola, report };
}