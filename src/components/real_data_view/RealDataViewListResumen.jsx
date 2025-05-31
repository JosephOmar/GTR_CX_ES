import React, { useEffect, useState } from "react";

const RealDataViewList = ({ selectedTeam, selectedDate }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://gtr-glovoes-cxpe.onrender.com/real-data-view/")
      .then((res) => res.json())
      .then((json) => {
        const filtered = json.filter(item => item.team === selectedTeam && item.date === selectedDate);
        setData(filtered);
      })
      .catch(console.error);
  }, [selectedTeam, selectedDate]);

  if (data.length === 0) return <div>Cargando datos...</div>;

  const totalForecastHours = data.reduce((acc, d) => acc + d.forecast_hours, 0);
  const totalScheduledHours = data.reduce((acc, d) => acc + d.scheduled_hours, 0);
  const totalRealHours = data.reduce((acc, d) => acc + ((d.real_agents) / 2 || 0), 0);

  const deltaForecast = totalRealHours - totalForecastHours;
  const deltaScheduled = totalRealHours - totalScheduledHours;

  const totalSATSamples = data.length > 0 ? data[0].sat_samples : 0;
  const satPromoters = data.length > 0 ? data[0].sat_promoters : 0;

  const satMonthly = data[0].sat_promoters_monthly || 0;
  const satOngoing = data[0].sat_ongoing || "-";

  const totalWeightedSLA = data.reduce((acc, d) => acc + (d.service_level * d.real_received), 0);
  const totalContacts = data.reduce((acc, d) => acc + d.real_received, 0);
  const sla = totalContacts > 0 ? totalWeightedSLA / totalContacts : 0;

  const forecastTotal = data.reduce((acc, d) => acc + d.forecast_received, 0);
  const realTotal = data.reduce((acc, d) => acc + d.real_received, 0);

  const volumeVsFCT = forecastTotal > 0 ? ((realTotal - forecastTotal) / forecastTotal) * 100 : 0;
  console.log(forecastTotal)
  console.log(realTotal)
  // % FCT Adherence tramo a tramo
  const fctAdherence = data.length > 0
  ? data.reduce((acc, d) => acc + ((d.real_received - d.forecast_received) / (d.forecast_received || 1)), 0) / data.length * 100
  : 0;

  return (
    <div className="max-w-sm mx-aut px-4 py-8 *:py-2 rounded shadow-md text-sm">
      <div className="text-center font-bold text-lg mb-2">{selectedTeam}</div>
      <div className="mb-1">Ongoing Forecast hours: <b>{totalForecastHours.toFixed(1)}</b></div>
      <div className="mb-1">Ongoing Scheduled hours: <b>{totalScheduledHours.toFixed(1)}</b></div>
      <div className="mb-1">Ongoing Real hours: <b>{totalRealHours.toFixed(1)}</b></div>
      <div className="mb-1">ONG Delta Real vs Forecast: <b>{deltaForecast.toFixed(1)} hrs ({((deltaForecast / totalForecastHours) * 100).toFixed(1)}%)</b></div>
      <div className="mb-1">ONG Delta Real vs Scheduled: <b>{deltaScheduled.toFixed(1)} hrs ({((deltaScheduled / totalScheduledHours) * 100).toFixed(1)}%)</b></div>
      <div className="mb-1">SAT Samples: <b>{totalSATSamples}</b></div>
      <div className="mb-1">Ongoing SAT: <b>{satOngoing}</b></div>
      <div className="bg-yellow-200 px-2 py-1 my-1 rounded">%SAT Promoters: <b>{satPromoters ? `${satPromoters.toFixed(2)}%` : "N/A"}</b></div>
      <div className="bg-yellow-300 px-2 py-1 my-1 rounded">%SAT Monthly Estimated: <b>{satMonthly}%</b></div>
      <div className="bg-[#00A082] text-white px-2 py-1 my-1 rounded">SLA: <b>{sla.toFixed(2)}%</b></div>
      <div className="bg-green-200 px-2 py-1 my-1 rounded">% - FCT Adherence: <b>{fctAdherence.toFixed(2)}%</b></div>
      <div className="bg-green-300 px-2 py-1 my-1 rounded">Volume vs FCT: <b>{volumeVsFCT.toFixed(2)}%</b></div>
    </div>
  );
};

export default RealDataViewList;
