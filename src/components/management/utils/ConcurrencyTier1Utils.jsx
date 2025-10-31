import { toUnicodeBold } from "./toUnicodeBold";

const CONCURRENCY_THRESHOLDS = { green: 1.5, orange: 2.5 };

const toNum = (str) => Number(str) || 0;

function getStatusColorConcurrency(value, { green, orange }) {
  if (value <= green) return '🟢';
  if (value <= orange) return '🟠';
  return '🔴';
}

export function buildCustomerTier1(data) {

  // Convertir valores numéricos, excluyendo 'team'
  const numericData = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => key !== 'team')
      .map(([key, value]) => [key, toNum(value)])
  );

  // Destructuring con valores por defecto
  const {   
    totalChats = 0,
    agentsOnline = 0,
    queue = 0,
    team = '',
  } = { team: data.team, ...numericData };

  const concurrency = (totalChats / agentsOnline).toFixed(1)

  // Colores
  const colorConcurrency = getStatusColorConcurrency(concurrency, CONCURRENCY_THRESHOLDS);

  // Datos Adicionales
  let capacity 
  team === 'CUSTOMER TIER1' ? capacity = 2 : capacity = 3
  const totalCapacity = agentsOnline * capacity;
  const remainingCapacity = totalCapacity - totalChats;
  const queuedChats = queue <= 0 ? 
        `  ${toUnicodeBold('Chats en Curso:')} ${totalChats}\n\n` +
        `  ${toUnicodeBold('Capacidad Total:')} ${totalCapacity}\n` +
        `  ${toUnicodeBold('Capacidad Restante ')} ${remainingCapacity}\n\n` +
        `  ${toUnicodeBold('Concurrencia:')} ${concurrency} ${colorConcurrency}` :
        `  ${toUnicodeBold('Chats en Cola:')} ${queue}\n\n` +
        `  ${toUnicodeBold('Todos los agentes tienen 3 chats asignados 🚨🚨')}`
  // Reporte final
  return (
    `${toUnicodeBold(`Capacidad ${team}`)}\n\n` +
    `  ${toUnicodeBold('Agentes Online:')} ${agentsOnline}\n` +
    `${queuedChats}`
  );
}
