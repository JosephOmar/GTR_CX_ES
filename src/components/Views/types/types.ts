
/** Un ítem individual de pronóstico */
export interface ForecastItem {
  /** Fecha en formato YYYY-MM-DD */
  date: string;
  /** Hora en formato HH:mm */
  time: string;
  /** Nombre de la cola */
  queue: string;
  /** Nivel de servicio real */
  sla: number;
  /** Contactos pronosticados */
  forecasted: number;
  /** Contactos reales */
  actual: number;
  /** AHT */
  aht: number;
  /** Desvío = actual − forecasted*/
  desvio?: number;
  /** Desvío porcentual = desvio / forecasted × 100 */
  desvioPercentage?: number;
}

/** Totales calculados sobre un conjunto de ForecastItem */
export interface Totals {
  /** Suma de todos los `forecasted` */
  slaTotal: number;
  /** Suma de todos los `forecasted` */
  forecastedTotal: number;
  /** Suma de todos los `actual` */
  actualTotal: number;
  /** Suma de todos los `desvio` */
  desvioTotal: number;
  /** Suma de todos los `desvioPercentage` */
  desvioPercentageTotal: number;
  /** Suma de todos los `desvioPercentage` */
  ahtTotal: number;
}
