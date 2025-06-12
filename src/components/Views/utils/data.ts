// utils/data.ts
import type { ForecastItem, Totals } from '../types/types';

export function parseCsvToJson(text: string): ForecastItem[] {
  const rows = text
    .split('\n')
    .map(r => r.trim())
    .filter(r => r.length > 0)
    .map(r => r.split(','));

  return rows.slice(1).map(r => {
    // r[0] ➔ "2025-06-11 14:30:00"
    const [datePart, timePart = ''] = r[0].split(' ');
    // timePart.slice(0,5) ➔ "14:30"
    const time = timePart.slice(0, 5);

    return {
      date: datePart,
      time,
      queue: r[5],
      sla: Number(parseFloat(r[7]).toFixed(2)),
      forecasted: Math.round(parseFloat(r[14])),
      actual: parseFloat(r[15]),
      aht: parseInt(r[17])  
    };
  });
}

export function calculateTotals(items: ForecastItem[]): Totals {
  let totalActual = 0;
  let weightedSlaSum = 0;
  let weightedAhtSum = 0;

  const totals = items.reduce<Totals>((acc, cur) => {
    const { sla, forecasted, actual, desvio, desvioPercentage, aht } = cur;

    // Sumar al total de 'actual'
    totalActual += actual;

    // Calcular la suma ponderada para sla y aht
    weightedSlaSum += sla * actual;
    weightedAhtSum += aht * actual;

    // Sumar los totales no ponderados
    acc.forecastedTotal += forecasted;
    acc.actualTotal += actual;
    acc.desvioTotal += desvio ?? 0;
    acc.desvioPercentageTotal += desvioPercentage ?? 0;

    return acc;
  }, {slaTotal: 0, forecastedTotal: 0, actualTotal: 0, desvioTotal: 0, desvioPercentageTotal: 0, ahtTotal: 0 });

  // Calcular los promedios ponderados
  totals.slaTotal = totalActual > 0 ? (weightedSlaSum / totalActual) : 0;
  totals.ahtTotal = totalActual > 0 ? (weightedAhtSum / totalActual) : 0;

  return totals;
}
