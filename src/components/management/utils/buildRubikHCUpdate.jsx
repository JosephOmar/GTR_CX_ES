import { toUnicodeBold } from "./toUnicodeBold";
import { getRoundedDisplayTimeSpain, getNextHourTimeSpain } from "../hooks/timeUtils";
import { getPlannedFor } from "./getPlannedFor";

const AGENTS_THRESHOLD = { green: 0.15, orange: 0.3};
const BACKLOG_THRESHOLD = { green: 20, orange: 30};

const toNum = (str) => Number(str) || 0;

function getStatusColorAgents(online, scheduled, { green, orange }) {
  if (scheduled*(1-green) < online) return '🟢';
  if (scheduled*(1-orange) < online) return '🟠';
  return '🔴';
}

function getStatusColorBacklog(backlog, { green, orange }) {
  if (backlog <= green) return '🟢';
  if (backlog <= orange) return '🟠';
  return '🔴';
}


export function buildRubikHCUpdate(data) {
  const t = getRoundedDisplayTimeSpain();
  const hourStart = getNextHourTimeSpain();

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
    backlogES = 0,
    backlogPT = 0,
    longestTime = 0
  } = { team: data.team, group: data.group, ...numericData };

  // Buscar planned programado para este team/hora
  const planned = getPlannedFor(team, hourStart, "Europe/Madrid");
  const agentsScheduled = planned?.scheduled_agents ?? 0;
  const agentsRequired = planned?.required_agents ?? 0;

  const colorAgents = getStatusColorAgents(agentsOnline, agentsScheduled, AGENTS_THRESHOLD)
  const colorBacklogES = getStatusColorBacklog(backlogES, BACKLOG_THRESHOLD)
  const colorBacklogPT = getStatusColorBacklog(backlogPT, BACKLOG_THRESHOLD)
  const colorLongestTime = (longestTime > 15 ) ? '🔴' : (longestTime > 6 ) ? '🟠' : '🟢'
  const longestTimeText = (longestTime > 0) ? `${colorLongestTime} Case con mayor tiempo en gestión: ${longestTime} min` : `🟢Sin casos en gestión`
  const isGroup = (group === 'Slack' ) ? `\n\n⚠️${toUnicodeBold(`Importante : Considerar que de forma automática se les está asignando a los agentes cases del skill ${team}-case-inbox-spa-ES-tier2 como prioridad 1, al término de bandeja se les asigna automáticamente  ${team}-case-inbox-por-PT-tier2BO`)}\n` +
    `⚠️${toUnicodeBold(`Casos de región GV_PT se reflejan en skill ${team}-case-inbox-spa-ES-tier2`)}` : ''
  // Reporte final
  return (
    `${toUnicodeBold(`PANEL ACTUAL ${team} - ${t} ES`)}\n\n` +
    `  ${colorAgents } ${agentsOnline} Agentes en gestión de ${agentsScheduled} programados\n` +
    `  ${colorBacklogES} Backlog: ${backlogES + backlogPT} cases\n` +
    `  ${longestTimeText}` +
    `${isGroup}`
  );
}
