import { toUnicodeBold } from "./toUnicodeBold";
import { getRoundedDisplayTimePortugal, getHourStartTimePortugal } from "../hooks/timeUtils";

const toNum = (str) => Number(str) || 0;


export function buildRubikHCUpdate(data) {
  const t = getRoundedDisplayTimePortugal();
  const hourStart = getHourStartTimePortugal();

  // Convertir valores numéricos, excluyendo 'team'
  const numericData = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => (key !== 'team' && key!== 'group'))
      .map(([key, value]) => [key, toNum(value)])
  );

  // Destructuring con valores por defecto
  const {
    team = '',
    group = '',
    agentsOnline = 0,
    agentsScheduled = 0,
    backlogES = 0,
    backlogPT = 0,
    longestTime = 0
  } = { team: data.team, group: data.group, ...numericData };

  const longestTimeText = (longestTime > 0) ? `🟢Case con mayor tiempo en gestión: ${longestTime} min` : `🟢Sin casos en gestión`
  const isGroup = (group === 'Slack' ) ? `\n\n⚠️${toUnicodeBold(`Importante : Considerar que de forma automática se les está asignando a los agentes cases del skill ${team}-case-inbox-spa-ES-tier2 como prioridad 1, al término de bandeja se les asigna automáticamente  ${team}-case-inbox-por-PT-tier2BO`)}\n` +
    `⚠️${toUnicodeBold(`Casos de región GV_PT se reflejan en skill ${team}-case-inbox-spa-ES-tier2`)}` : ''

  // Reporte final
  return (
    `${toUnicodeBold(`🔰 PANEL ACTUAL ${team} - ${t} PT`)}\n\n` +
    `🟢${agentsOnline} Agentes en gestión de ${agentsScheduled} programados\n` +
    `🟢${team}-case-inbox-spa-ES-tier2 : ${backlogES} cases\n` +
    `🟢${team}-case-inbox-por-PT-tier2BO : ${backlogPT} cases\n` +
    `${longestTimeText}` +
    `${isGroup}`
  );
}
