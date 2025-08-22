import { toUnicodeBold } from "./toUnicodeBold";
import { getRoundedDisplayTime, getHourStartTime, getRoundedDisplayTimeSpain, getHourStartTimeSpain } from "../hooks/timeUtils";

export const toNum = (str) => Number(str) || 0;

export function buildCustomerHC(data) {
  const t = getRoundedDisplayTimeSpain();
  const hourStart = getHourStartTimeSpain();

  // Excluir el valor 'team' de la conversión a número
  const numericData = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => key !== 'team') // Excluir 'team' de la conversión
      .map(([key, value]) => [key, toNum(value)]) // Convertir solo los valores numéricos
  );

  // Recuperar 'team' sin modificar
  const { team, currentSla, totalChats, ART, FRT, agentsOnline, agentsScheduled, agentsRequired, chatsInterval, onlineChats, slaInterval } = { team: data.team, ...numericData };

  const colorSLA = (currentSla > 80) ? '🟢' : (currentSla > 70) ? '🟠' : '🔴';
  const colorSLAInterval = (slaInterval > 80) ? '🟢' : (slaInterval > 70) ? '🟠' : '🔴';
  const colorART = (ART >= 420) ? '🔴' : '🟢';
  const colorFRT = (FRT > 30) ? '🔴' : '🟢';
  const nonBreachedChat = Math.round((totalChats * currentSla) / 100);
  const onlineChatsText = (onlineChats > 0) ? ', por actualizar SLA.' : '.';

  return (
    `${toUnicodeBold(`CHAT ${team} - ${currentSla}% ${colorSLA} - CORTE ${t} Hrs`)}\n\n` +
    `${nonBreachedChat}/${totalChats} chat atendidos a tiempo!!\n\n` +
    `${colorFRT} FRT: ${FRT}\n` +
    `🟢 Se tienen: ${agentsOnline} Agentes en gestión de ${agentsScheduled} Programados / Requeridos ${agentsRequired}\n` +
    `${colorSLAInterval} SLA ${hourStart} HE ${chatsInterval}Q - SLA ${slaInterval}%\n` +
    `⚠️ ${onlineChats} Chats en curso${onlineChatsText}`
  );
}