// src/hooks/useForecasts.ts
import { useState, useEffect, useCallback } from 'react';
import type { ForecastItem, Totals } from '../types/types';
import { parseCsvToJson, calculateTotals } from '../utils/data';
import { generateTimeOptions } from '../utils/time';

export function useForecasts() {
  const [data, setData] = useState<ForecastItem[]>([]);
  const [queueFilter, setQueueFilter] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string[]>([]);
  const [firstClicked, setFirstClicked] = useState<string | null>(null);
  const [filtered, setFiltered] = useState<ForecastItem[]>([]);
  const [totals, setTotals] = useState<Totals>({
    slaTotal: 0,
    forecastedTotal: 0,
    actualTotal: 0,
    desvioTotal: 0,
    desvioPercentageTotal: 0,
    ahtTotal: 0
  });

  const loadFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      setData(parseCsvToJson(csvText));
    };
    reader.readAsText(file);
  }, []);

  const applyFilter = useCallback(() => {
    let result = data;
    if (queueFilter) {
      result = result.filter(item => item.queue === queueFilter);
    }
    if (timeRange.length) {
      result = result.filter(item => timeRange.includes(item.time));
    }
    // calcular desvíos
    result = result.map(item => {
      const desvio = item.actual - item.forecasted;
      return {
        ...item,
        desvio,
        desvioPercentage: (desvio / item.forecasted) * 100
      };
    });
    setFiltered(result);
    setTotals(calculateTotals(result));
  }, [data, queueFilter, timeRange]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

 
  const handleTimeSelect = (time: string) => {
    const options = generateTimeOptions();
    if (!firstClicked) {
      setFirstClicked(time);
      setTimeRange([time]);
    } else {
      const start = Math.min(options.indexOf(firstClicked), options.indexOf(time));
      const end   = Math.max(options.indexOf(firstClicked), options.indexOf(time));
      setTimeRange(options.slice(start, end + 1));
      setFirstClicked(null);
    }
  };

  return {
    filtered,
    totals,
    loadFile,
    queueFilter,
    setQueueFilter,
    timeRange,
    handleTimeSelect,  
  };
}
