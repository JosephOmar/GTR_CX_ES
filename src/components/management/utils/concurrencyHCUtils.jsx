import { toUnicodeBold } from "./toUnicodeBold";
import { getRoundedDisplayTimeSpain, getHourStartTimeSpain } from "../hooks/timeUtils";

const SLA_THRESHOLDS = { green: 80, orange: 70 };
const FRT_THRESHOLD = 30;

const toNum = (str) => Number(str) || 0;

function getStatusColor(value, { green, orange }) {
  if (value > green) return '🟢';
  if (value > orange) return '🟠';
  return '🔴';
}

export function buildCustomerHC(data) {
  const t = getRoundedDisplayTimeSpain();
  const hourStart = getHourStartTimeSpain();

  // Convertir valores numéricos, excluyendo 'team'
  const numericData = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => key !== 'team')
      .map(([key, value]) => [key, toNum(value)])
  );

  // Destructuring con valores por defecto
  const {
    team = '',
    currentSla = 0,
    totalChats = 0,
    FRT = 0,
    agentsCurrent = 0,
    agentsOnline = 0,
    agentsScheduled = 0,
    agentsRequired = 0,
    chatsInterval = 0,
    onlineChats = 0,
    slaInterval = 0
  } = { team: data.team, ...numericData };

  // Colores
  const colorSLA = getStatusColor(currentSla, SLA_THRESHOLDS);
  const colorSLAInterval = getStatusColor(slaInterval, SLA_THRESHOLDS);
  const colorFRT = FRT > FRT_THRESHOLD ? '🔴' : '🟢';

  // Datos derivados
  const nonBreachedChat = Math.round((totalChats * currentSla) / 100);
  const onlineChatsText = onlineChats > 0 ? ', por actualizar SLA.' : '.';
  const chatsIntervalText =
    chatsInterval > 0
      ? `${colorSLAInterval} SLA ${hourStart} HE ${chatsInterval}Q - SLA ${slaInterval}%\n`
      : `🟢 Sin chats en el rango de las ${hourStart}\n`;
  const agentsCurrentText = 
    agentsCurrent > 0
      ? `🟢 Se tienen ${agentsCurrent} agentes en gestión\n`
      : `🔴 Sin agentes conectados hasta las 08:00 HE\n`

  // Reporte final
  return (
    `${toUnicodeBold(`CHAT ${team} - ${currentSla}% ${colorSLA} - CORTE ${t} Hrs`)}\n\n` +
    `${nonBreachedChat}/${totalChats} chat atendidos a tiempo!!\n\n` +
    `${colorFRT} FRT: ${FRT}\n` +
    `${agentsCurrentText}` +
    `${chatsIntervalText}` +
    `⚠️ ${onlineChats} Chats en curso${onlineChatsText}\n\n` +
    `🟢 Gestionaron ${agentsOnline} Agentes de ${agentsScheduled} Programados / Requeridos ${agentsRequired}`
  );
}
