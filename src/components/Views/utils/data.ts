// utils/data.ts
import type { ForecastItem, Totals } from '../types/types';
import { toUnicodeBold } from '../../management/utils/toUnicodeBold';

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

    const validActual = typeof sla === 'number' && !isNaN(sla);

    if (validActual) {
      totalActual += actual;
      weightedSlaSum += sla * actual;
      weightedAhtSum += aht * actual;
      acc.actualTotal += actual;
    }

    acc.forecastedTotal += forecasted ?? 0;
    acc.desvioTotal += desvio ?? 0;
    acc.desvioPercentageTotal += desvioPercentage ?? 0;

    return acc;
  }, {
    slaTotal: 0,
    forecastedTotal: 0,
    actualTotal: 0,
    desvioTotal: 0,
    desvioPercentageTotal: 0,
    ahtTotal: 0,
  });

  totals.slaTotal = totalActual > 0 ? weightedSlaSum / totalActual : 0;
  totals.ahtTotal = totalActual > 0 ? weightedAhtSum / totalActual : 0;

  return totals;
}

export function calculateDeviationAnalysis(items: ForecastItem[]): string {
  const deviationThreshold = 50; // Umbral de desviación
  let analysis = '';
  const significantDeviations: { time: string; desvioPercentage: number; desvio: number }[] = [];
  let totalDeviation = 0;
  let totalDesvioPercentage = 0;
  let count = 0;
  
  // Analizar cada intervalo de datos
  items.forEach((item) => {
    const { time, desvio, desvioPercentage, sla } = item;

    // Solo analizamos cuando el SLA es menor a 70
    if (sla < 70 && (desvioPercentage || 50) > deviationThreshold) {
      significantDeviations.push({ time, desvioPercentage: desvioPercentage || 30, desvio: desvio || 0 });
      totalDeviation += desvio || 0;
      totalDesvioPercentage += desvioPercentage || 0;
      count++;
    }
  });

  // Si encontramos desviaciones significativas, las mostramos
  if (significantDeviations.length > 0) {
    // Ordenar los picos por el valor de la desviación de mayor a menor
    significantDeviations.sort((a, b) => b.desvio - a.desvio);

    // Tomar los primeros 5 picos más altos
    const topDeviations = significantDeviations.slice(0, 5);

    topDeviations.sort((a, b) => a.time.localeCompare(b.time));
    
    // Título con emojis
    analysis += `📊 ${toUnicodeBold('Datos Assembled')}📝\n\n`;

    // Detalle de los picos de desviación
    analysis += topDeviations.map((deviation) =>
      `⏰ A las ${toUnicodeBold(`${deviation.time}`)}, se detectó un incremento de contactos con un desvío de ${toUnicodeBold(`+${deviation.desvio}Q / ${deviation.desvioPercentage.toFixed(2)}%`)}.`
    ).join("\n\n");
    
    // Resumen de promedios de desviación
    const totalDeviation = topDeviations.reduce((sum, deviation) => sum + deviation.desvio, 0);
    const averageDesvioPercentage = topDeviations.reduce((sum, deviation) => sum + (deviation.desvio * deviation.desvioPercentage), 0) / totalDeviation;
    
    analysis += `\n\n📈 ${toUnicodeBold('Resumen')}:\n ${toUnicodeBold(`🔺Q de desvío: ${totalDeviation.toFixed(0)}`)}\n${toUnicodeBold(`📊 Promedio de desviación porcentual: ${averageDesvioPercentage.toFixed(2)}%`)}`;

  } else {
    analysis = '❌ No se detectaron picos significativos en el desvío durante el día.';
  }

  return analysis;
}



