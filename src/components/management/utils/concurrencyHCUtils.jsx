import { toUnicodeBold } from "./toUnicodeBold";
import { getRoundedDisplayTimeSpain, getHourStartTimeSpain } from "../hooks/timeUtils";
import { getPlannedFor } from "./getPlannedFor";

const SLA_THRESHOLDS = { green: 80, orange: 70 };
const FRT_THRESHOLD = 30;
const AGENTS_THRESHOLD = { green: 0.15, orange: 0.3};

const toNum = (str) => Number(str) || 0;

function getStatusColorSLA(value, { green, orange }) {
  if (value >= green) return '🟢';
  if (value >= orange) return '🟠';
  return '🔴';
}

function getStatusColorAgents(online, scheduled, { green, orange }) {
  if (scheduled*(1-green) < online) return '🟢';
  console.log(scheduled*(1-green))
  if (scheduled*(1-orange) < online) return '🟠';
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
    chatsInterval = 0,
    onlineChats = 0,
    slaInterval = 0
  } = { team: data.team, ...numericData };

  // Buscar planned programado para este team/hora
  const planned = getPlannedFor(team, hourStart, "Europe/Madrid");
  const agentsScheduled = planned?.scheduled_agents ?? 0;
  const agentsRequired = planned?.required_agents ?? 0;

  // Colores
  const colorSLA = getStatusColorSLA(currentSla, SLA_THRESHOLDS);
  const colorSLAInterval = getStatusColorSLA(slaInterval, SLA_THRESHOLDS);
  const colorFRT = FRT > FRT_THRESHOLD ? '🔴' : '🟢';
  const colorAgents = getStatusColorAgents(agentsOnline, agentsScheduled, AGENTS_THRESHOLD)
  const colorCurrentChats = (onlineChats > 0) ? '⚠️' : '🟢'

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
    `${toUnicodeBold(`${team} - ${currentSla}% ${colorSLA} - CORTE ${t} Hrs`)}\n\n` +
    `${nonBreachedChat}/${totalChats} chat atendidos a tiempo!!\n\n` +
    `${colorFRT} FRT: ${FRT}\n` +
    `${agentsCurrentText}` +
    `${chatsIntervalText}` +
    `${colorCurrentChats} ${onlineChats} Chats en curso${onlineChatsText}\n\n` +
    `${colorAgents} Gestionaron ${agentsOnline} Agentes de ${agentsScheduled} Programados / Requeridos ${agentsRequired}`
  );
}
