import React, { useEffect, useState } from "react";
import html2canvas from 'html2canvas-pro';

const agentMetrics = [
  { label: "Required Agents", key: "required_agents" },
  { label: "Scheduled Agents", key: "scheduled_agents" },
  { label: "Agents Online", key: "agents_online" },
  { label: "Agents Training Glovo", key: "agents_training" },
  { label: "Agents Others Aux", key: "agents_aux" },
  { label: "Delta Real vs Forecast Agents", key: "delta_agents" },
];

const volumeMetrics = [
  { label: "Forecast Volumes", key: "forecast_received" },
  { label: "Real Volumes", key: "real_received" },
  { label: "Delta Real vs Forecast Volumes", key: "delta_volumes" },
  { label: "% Delta Real vs Forecast", key: "percent_delta_volumes" },
];

const kpiMetrics = [
  { label: "SLA'", key: "service_level" },
  { label: "AHT", key: "aht" },
  { label: "SAT ABUSER", key: "sat_abuser" },
  { label: "SAT", key: "sat_interval" },
];

const getBackgroundColorByMetric = (key) => {
  switch (key) {
    case "required_agents":
      return "bg-[#FFC244]"
    case "scheduled_agents":
      return "bg-[#20e3cd]"
    case "agents_online":
      return "bg-[#78d12f]";
    case "agents_training":
    case "agents_aux":
      return "bg-[#ff9248]"
    case "forecast_received":
      return "bg-[#20e3cd]"
    case "real_received":
      return "bg-[#78d12f]";
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
    fetch("https://gtr-glovoes-cxpe.onrender.com/real-data-view/")
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

  const handleCapture = () => {
    const tableElement = document.getElementById("data-table");
    if (tableElement) {
      html2canvas(tableElement).then((canvas) => {
        const imageURL = canvas.toDataURL();
        const link = document.createElement("a");
        link.href = imageURL;
        link.download = "tabla.png"; 
        link.click(); 
      });
    }
  };

  const getValue = (item, key) => {
    if (key === "delta_volumes") return item.real_received - item.forecast_received;
  
    if (key === "delta_agents") return item.agents_online - item.scheduled_agents;
  
    if (key === "percent_delta_volumes") {
      const forecast = item.forecast_received;
      const real = item.real_received;
  
      if (forecast === 0) {
        if (real === 0) return "0.00%";
        return ((real - forecast) / 1 * 100).toFixed(2) + "%";
      }
  
      const percent = ((real - forecast) / forecast) * 100;
      return percent.toFixed(2) + "%";
    }
  
    if (key === "service_level") return item.service_level + "%";
  
    if (key === "sat_interval") return item.sat_interval + "%";
  
    return item[key] ?? "N/A";
  };

  const getCellClassRealvsFRTAgents = (key, value) => {
    if (key === "delta_agents") {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        return numeric < 0 ? "bg-red-200" : " bg-green-200";
      }
    }
    return "";
  };

  const getCellClassRealvsFRT = (key, value) => {
    if (key === "percent_delta_volumes" || key === 'delta_volumes') {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        return numeric < 0 ? "bg-red-200" : " bg-green-200";
      }
    }
    return "";
  };

  const getCellClassSLA = (key, value) => {
    if (key === "service_level") {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        return numeric < 90 ? "bg-red-200" : " bg-green-200";
      } else {
        return "bg-white"
      }
    }
    return "";
  };

  const getCellClassSAT = (key, value) => {
    if (key === "sat_interval") {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        return numeric < 81 ? "bg-red-200" : " bg-green-200";
      } else {
        return "bg-white"
      }
    }
    return "";
  };

  const getCellClassSATAbuser = (key, value) => {
    if (key === "sat_abuser") {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        return numeric < 4.1 ? "bg-red-200" : " bg-green-200";
      } else {
        return "bg-white"
      }
    }
    return "";
  };

  const getCellClassAHT = (key, value) => {
    if (key === "aht") {
      const numeric = parseFloat(value);
      if (!isNaN(numeric)) {
        if(selectedTeam==='CHAT CUSTOMER') return numeric > 420 ? "bg-red-200" : " bg-green-200";
        else if(selectedTeam === 'CHAT RIDER' || selectedTeam === 'CALL VENDORS') return numeric > 180 ? "bg-red-200" : " bg-green-200";
      } else {
        return "bg-white"
      }
    }
    return "";
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse" id="data-table">
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
            {/* AGENTS */}
            <tr>
              <td colSpan={data.length + 1} className="bg-gray-200 font-bold text-sm ">AGENTS</td>
            </tr>
            {agentMetrics.map((metric) => (
              <tr key={metric.key}>
                <td className={`border px-4 py-2 bg-gray-50 font-medium min-w-[210px] text-xs`}>{metric.label}</td>
                {data.map((item) => {
                  const value = getValue(item, metric.key);
                  return (
                    <td
                      key={`${item.id}-${metric.key}`}
                      className={`border px-4 py-2 text-center font-bold text-xs ${getBackgroundColorByMetric(metric.key)} ${getCellClassRealvsFRTAgents(metric.key, value)}`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* VOLUMES */}
            <tr>
              <td colSpan={data.length + 1} className="bg-gray-200 font-bold text-sm">VOLUMES</td>
            </tr>
            {volumeMetrics.map((metric) => (
              <tr key={metric.key}>
                <td className="border px-4 py-2 bg-gray-50 font-medium min-w-[210px] text-xs">{metric.label}</td>
                {data.map((item) => {
                  const value = getValue(item, metric.key);
                  return (
                    <td
                      key={`${item.id}-${metric.key}`}
                      className={`border px-4 py-2 text-center font-bold text-xs ${getBackgroundColorByMetric(metric.key)} ${getCellClassRealvsFRT(metric.key, value)}`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* KPIS */}
            <tr>
              <td colSpan={data.length + 1} className="bg-gray-200 font-bold text-sm">KPIS</td>
            </tr>
            {kpiMetrics.map((metric) => (
              <tr key={metric.key}>
                <td className="border px-4 py-2 bg-gray-50 font-medium min-w-[210px] text-xs">{metric.label}</td>
                {data.map((item) => {
                  const value = getValue(item, metric.key);
                  return (
                    <td
                      key={`${item.id}-${metric.key}`}
                      className={`border px-4 py-2 text-center font-bold text-xs ${getBackgroundColorByMetric(metric.key)} ${getCellClassAHT(metric.key, value)} ${getCellClassSLA(metric.key, value)} ${getCellClassSAT(metric.key, value)} ${getCellClassSATAbuser(metric.key, value)}`}
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
      <div className="p-4 text-center">
        <button onClick={handleCapture} className=" p-2 bg-blue-500 text-white">
          Download Table
        </button>
      </div>
      
    </div>
  );
};

export default RealDataViewList;
