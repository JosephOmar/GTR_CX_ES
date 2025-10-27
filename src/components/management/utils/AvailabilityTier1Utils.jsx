import { toUnicodeBold } from "./toUnicodeBold";

const CONCURRENCY_THRESHOLDS = { green: 1.5, orange: 2.5 };

const toNum = (str) => Number(str) || 0;

function getStatusColorConcurrency(value, { green, orange }) {
  if (value <= green) return '🟢';
  if (value <= orange) return '🟠';
  return '🔴';
}

export function buildAvailabilityTier1(data) {

  // Convertir valores numéricos, excluyendo 'team'
  const numericData = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => key !== 'team')
      .map(([key, value]) => [key, toNum(value)])
  );

  // Destructuring con valores por defecto
  const {   
    totalChatsCS = 0,
    agentsOnlineCS = 0,
    totalChatsRD = 0,
    agentsOnlineRD = 0,
  } = { ...numericData };

  const concurrencyCS = (totalChatsCS / agentsOnlineCS).toFixed(1)
  const concurrencyRD = (totalChatsRD / agentsOnlineRD).toFixed(1)

  const necessaryAgentsCS = Math.ceil(totalChatsCS / 1.5)
  const necessaryAgentsRD = Math.ceil(totalChatsRD / 2)

  let percentajeForAvailabilityCS
  agentsOnlineCS > 50 ? percentajeForAvailabilityCS = 0.9 : agentsOnlineCS > 6 ? percentajeForAvailabilityCS = 0.8 : percentajeForAvailabilityCS = 0.5

  let percentajeForAvailabilityRD
  agentsOnlineRD > 50 ? percentajeForAvailabilityRD = 0.9 : agentsOnlineRD > 6 ? percentajeForAvailabilityRD = 0.8 : percentajeForAvailabilityRD = 0.5

  let availabilityAgentsCS
  let availabilityAgentsRD

  concurrencyCS >= 1.8 ? availabilityAgentsCS = 0 : availabilityAgentsCS = Math.floor((agentsOnlineCS - necessaryAgentsCS)*percentajeForAvailabilityCS)
  concurrencyRD >= 2.8 ? availabilityAgentsRD = 0 : availabilityAgentsRD = Math.floor((agentsOnlineRD - necessaryAgentsRD)*percentajeForAvailabilityRD)

  availabilityAgentsCS < 0 ? availabilityAgentsCS = 0 : ''
  availabilityAgentsRD < 0 ? availabilityAgentsRD = 0 : ''

  // Colores
//   const colorConcurrency = getStatusColorConcurrency(concurrency, CONCURRENCY_THRESHOLDS);

  return (
    `${toUnicodeBold(`Customer T1 Capacidad ${concurrencyCS} - Disponibilidad de ${availabilityAgentsCS} HC para refuerzo o apoyo a Vendor`)}\n` +
    `${toUnicodeBold(`Rider T1 Capacidad ${concurrencyRD} - Disponibilidad de ${availabilityAgentsRD} HC para refuerzo o apoyo a Vendor`)}\n\n` +
    `${toUnicodeBold(`🚨Tener en cuenta que se debe avanzar por equipo de Supervisión y compartir la lista de los As para el control interno`)}`
  );
}
