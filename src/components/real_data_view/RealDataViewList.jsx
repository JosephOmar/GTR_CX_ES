import React, { useEffect, useState } from "react";

const metrics = [
  { label: "Scheduled Agents", key: "scheduled_agents" },
  { label: "Forecast Agents", key: "required_agents" },
  { label: "Agents Staffed Real Time", key: "real_agents" },
  { label: "Delta Real vs Forecast Agents", key: "delta_agents" },
  { label: "Forecast Volumes", key: "forecast_received" },
  { label: "Real Volumes", key: "real_received" },
  { label: "Delta Real vs Forecast Volumes", key: "delta_volumes" },
  { label: "% Delta Real vs Forecast", key: "percent_delta_agents" },
  { label: "Service Level 30'", key: "service_level" },
  { label: "SAT", key: "sat_interval" },

];

const getBackgroundColorByMetric = (key) => {
  switch (key) {
    case "scheduled_agents":
    case "required_agents":
    case "real_agents":
      return "bg-[#CDE3F8]";
    case "forecast_received":
    case "real_received":
      return "bg-[#D7D1FB]";
    case "service_level":
      return "bg-[#A7F3F0]";
    case "sat_interval":
      return "bg-[#DAEAFD]";
    case "delta_volumes":
      return "bg-[#F3F4F6]";
    case "delta_agents":
      return "bg-[#00A082]";  
    default:
      return "";
  }
};


const RealDataViewList = ({ selectedTeam, selectedDate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:8000/real-data-view/")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar datos");
        return res.json();
      })
      .then((json) => {
        const filtered = json
          .filter((item) => item.team === selectedTeam && item.date === selectedDate)
          .sort((a, b) => a.time_interval.localeCompare(b.time_interval));
        setData(filtered);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedTeam, selectedDate]);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error: {error}</p>;
  if (data.length === 0) return <p>No hay datos para {selectedTeam}.</p>;

  const getValue = (item, key) => {
    if (key === "delta_volumes") return item.real_received - item.forecast_received;
    if (key === "delta_agents") return item.real_agents - item.required_agents;
    if (key === "percent_delta_agents") {
      return item.required_agents === 0
        ? "N/A"
        : (((item.real_received - item.forecast_received) / item.forecast_received) * 100).toFixed(2) + "%";
    }
    if (key === "service_level") return item.service_level + "%";
    if (key === "sat_interval") return item.sat_interval + "%";
    return item[key] ?? "N/A";
  };

  const getCellClassSLA = (key, value) => {
    if (key === "service_level") {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        return numeric < 90 ? "text-red-800" : " text-green-800";
      }
    }
    return "";
  };

  const getCellClassSAT = (key, value) => {
    if (key === "sat_interval") {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        return numeric < 83 ? "text-red-800" : " text-green-800";
      }
    }
    return "";
  };

  const getCellClassRealvsFRT = (key, value) => {
    if (key === "delta_agents") {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        return numeric < 0 ? "bg-red-200" : " bg-green-200";
      }
    }
    return "";
  };

  const getCellClassRealvsFRTVolumes = (key, value) => {
    if (key === "delta_volumes" || key === "percent_delta_agents") {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        return numeric > 0 ? "bg-red-200" : " bg-green-200";
      }
    }
    return "";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-[#00A082] min-w-[210px] text-left text-xs text-white">Métrica</th>
            {data.map((item) => (
              <th key={item.time_interval} className="border px-4 py-2 bg-[#00A082] text-white text-center whitespace-nowrap text-xs">
                {item.time_interval}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.key}>
              <td className="border px-4 py-2 bg-gray-50 font-medium min-w-[210px] text-xs">{metric.label}</td>
              {data.map((item) => {
                const value = getValue(item, metric.key);
                return (
                  <td
                    key={`${item.id}-${metric.key}`}
                    className={`border px-4 py-2 text-center font-bold text-xs ${getBackgroundColorByMetric(metric.key)} ${getCellClassSLA(metric.key, value)} ${getCellClassSAT(metric.key, value)} ${getCellClassRealvsFRT(metric.key, value)} ${getCellClassRealvsFRTVolumes(metric.key, value)}`}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RealDataViewList;
