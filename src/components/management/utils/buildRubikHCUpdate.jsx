import { toUnicodeBold } from "./toUnicodeBold";
import { getRoundedDisplayTimePortugal, getHourStartTimePortugal } from "../hooks/timeUtils";

const toNum = (str) => Number(str) || 0;


export function buildRubikHCUpdate(data) {
  const t = getRoundedDisplayTimePortugal();
  const hourStart = getHourStartTimePortugal();

  // Convertir valores numéricos, excluyendo 'team'
  const numericData = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => key !== 'team')
      .map(([key, value]) => [key, toNum(value)])
  );

  // Destructuring con valores por defecto
  const {
    team = '',
    agentsOnline = 0,
    agentsScheduled = 0,
    backlogES = 0,
    backlogPT = 0,
    longestTime = 0
  } = { team: data.team, ...numericData };

  const totalBacklog = backlogES + backlogPT
  const longestTimeText = (longestTime > 0) ? `🟢Case con mayor tiempo en gestión: ${longestTime} min` : `🟢Sin casos en gestión`
  // Reporte final
  return (
    `${toUnicodeBold(`🔰 PANEL ACTUAL ${team} - ${t} PT`)}\n\n` +
    `🟢Contamos con ${agentsOnline} Agentes en gestión de ${agentsScheduled} programados\n` +
    `🟢Backlog: ${totalBacklog} cases (${team}-case-inbox-spa-ES-tier2 + ${team}-case-inbox-por-PT-tier2BO\n` +
    `${longestTimeText}`
  );
}
