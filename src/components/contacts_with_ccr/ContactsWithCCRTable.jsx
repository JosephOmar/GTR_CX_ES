import React, { useEffect, useMemo, useRef, useState } from "react";
import { useContactsWithCCRStore } from "./ContactsWithCCRStore";
import { usePlannedDataStore } from "../views/store/PlannedDataStore";
import UploadContactsWithCCRModal from "./UploadContactsWithCCRModal";
import html2canvas from "html2canvas-pro";

export default function ContactsWithCCRTable() {
  const {
    contactsWithCCRData,
    fetchContactsWithCCRData,
    loading: loadingContacts,
  } = useContactsWithCCRStore();

  const {
    plannedData,
    fetchPlannedData,
    loading: loadingPlanned,
  } = usePlannedDataStore();

  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedIntervals, setSelectedIntervals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const table1Ref = useRef(null);
  const table2Ref = useRef(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const loading = loadingContacts || loadingPlanned;

  const teams = [
    "All",
    "Customer Live",
    "Customer Non Live",
    "Customer Tier2",
    "Vendor Tier1",
    "Vendor Tier2",
    "Rider Tier1",
    "Rider Tier2",
  ];

  const hours = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) =>
        String(i).padStart(2, "0") + ":00"
      ),
    []
  );

  useEffect(() => {
    fetchContactsWithCCRData();
    fetchPlannedData();
  }, []);

  const dates = useMemo(() => {
    return ["All", ...new Set(contactsWithCCRData?.map(d => d.date_pe))];
  }, [contactsWithCCRData]);

  // 🔗 Merge forecast con contacts
  const mergedData = useMemo(() => {
    return contactsWithCCRData?.map(row => {
      const forecast = plannedData.find(
        p =>
          p.team === row.team &&
          p.date === row.date_es &&
          p.interval === row.interval_es
      );

      const forecastReceived = forecast?.forecast_received || 0;
      const deviation = row.contacts_received - forecastReceived;
      const percentDeviation =
        forecastReceived > 0
          ? ((deviation / forecastReceived) * 100).toFixed(1)
          : row.contacts_received * 100;

      return {
        ...row,
        forecast_received: forecastReceived,
        deviation,
        percentDeviation,
      };
    });
  }, [contactsWithCCRData, plannedData]);

  // ⏱️ Filtro por rango horario
  let filteredData = mergedData;

  if (selectedIntervals.length === 2) {
    const [start, end] = [...selectedIntervals].sort();
    const range = hours.slice(
      hours.indexOf(start),
      hours.indexOf(end) + 1
    );

    filteredData = mergedData.filter(
      row =>
        (selectedTeam === "All" || row.team === selectedTeam) &&
        (selectedDate === "All" || row.date_pe === selectedDate) &&
        range.includes(row.interval_pe)
    );
  } else {
    filteredData = mergedData.filter(row => {
      const matchTeam = selectedTeam === "All" || row.team === selectedTeam;
      const matchDate = selectedDate === "All" || row.date_pe === selectedDate;
      const matchInterval =
        selectedIntervals.length === 0 ||
        selectedIntervals.includes(row.interval_pe);

      return matchTeam && matchDate && matchInterval;
    });
  }

  const handleIntervalClick = hour => {
    setSelectedIntervals(prev => {
      if (prev.includes(hour)) return prev.filter(h => h !== hour);
      if (prev.length === 2) return [prev[1], hour];
      return [...prev, hour];
    });
  };

  // 🎨 Color dinámico para desvío y %
  const deviationClass = (deviation, percent) => {
    if (deviation < 0) return "text-green-600";
    if (percent < 30) return "text-orange-500";
    return "text-red-600";
  };

  // 📊 Totales
  const totalsTable1 = useMemo(() => {
    return filteredData.reduce(
      (acc, row) => {
        acc.forecast += row.forecast_received || 0;
        acc.received += row.contacts_received || 0;
        return acc;
      },
      { forecast: 0, received: 0 }
    );
  }, [filteredData]);

  const deviationTotal =
    totalsTable1.received - totalsTable1.forecast;

  const percentDeviationTotal =
    totalsTable1.forecast > 0
      ? ((deviationTotal / totalsTable1.forecast) * 100).toFixed(1)
      : totalsTable1.received * 100;

  // 📋 Copiar CCR texto
  const handleCopyCCR = contactReasons => {
    const sorted = [...contactReasons].sort((a, b) => b.count - a.count);
    const text =
      "Contacts Reason del Tramo\n\n" +
      sorted
        .map(cr => `${cr.contact_reason} - ${cr.count} casos`)
        .join("\n");

    navigator.clipboard.writeText(text);
  };

  // 📊 Tabla 2 acumulada
  const accumulatedReasons = useMemo(() => {
    const acc = {};
    filteredData.forEach(row => {
      row.contact_reasons?.forEach(cr => {
        acc[cr.contact_reason] =
          (acc[cr.contact_reason] || 0) + cr.count;
      });
    });

    return Object.entries(acc)
      .map(([contact_reason, count]) => ({ contact_reason, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredData]);

  const totalContactsReasons = accumulatedReasons.reduce(
    (sum, r) => sum + r.count,
    0
  );

  // 📸 Copiar tabla como imagen
  const copyTableAsImage = async ref => {
    const canvas = await html2canvas(ref.current);
    canvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    });
  };

  if (loading) {
    return <p className="p-4 text-gray-500">Cargando datos...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Contacts with CCR</h2>

      <UploadContactsWithCCRModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={fetchContactsWithCCRData}
      />

      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm mb-4"
      >
        Subir Datos Contacts With CCR
      </button>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="text-sm">Team</label>
          <select
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
            className="block border px-3 py-1 rounded"
          >
            {teams.map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm">Fecha (PE)</label>
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="block border px-3 py-1 rounded"
          >
            {dates.map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            fetchContactsWithCCRData(true);
          }}
          className="self-end px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          🔄 Actualizar datos
        </button>
      </div>

      {selectedTeam !== "All" && selectedDate !== "All" && (
        <>
          {/* ⏱️ Filtro Horario */}
          <div className="flex flex-wrap gap-1 mb-4">
            {hours.map(hour => (
              <button
                key={hour}
                onClick={() => handleIntervalClick(hour)}
                className={`px-3 py-1 text-xs rounded ${
                  selectedIntervals.includes(hour)
                    ? "bg-blue-500 text-white border"
                    : "bg-gray-100"
                }`}
              >
                {hour}
              </button>
            ))}
          </div>

          {/* TABLA 1 */}
          <button
            onClick={() => copyTableAsImage(table1Ref)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm mb-4"
          >
            Copiar Tabla Forecast
          </button>

          <div ref={table1Ref} className="overflow-x-auto mb-6">
            <table className="mx-auto min-w-[70vw] border text-sm">
              <thead className="bg-primary">
                <tr>
                    <th colSpan={2}>{selectedDate}</th>
                    <th colSpan={5}>{selectedTeam}</th>
                </tr>
                <tr>
                  <th>Interval PE</th>
                  <th>Interval ES</th>
                  <th>Forecast</th>
                  <th>Received</th>
                  <th>Deviation</th>
                  <th>%</th>
                  <th>CCR</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr key={i} className="text-center border-t *:py-2">
                    <td>{row.interval_pe}</td>
                    <td>{row.interval_es}</td>
                    <td>{row.forecast_received}</td>
                    <td>{row.contacts_received}</td>
                    <td className={deviationClass(row.deviation, row.percentDeviation)}>
                      {row.deviation}
                    </td>
                    <td className={deviationClass(row.deviation, row.percentDeviation)}>
                      {row.percentDeviation}%
                    </td>
                    <td>
                      <div
                        onClick={() => handleCopyCCR(row.contact_reasons)}
                        className=" cursor-pointer"
                      >
                        CCR
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-primary font-semibold text-center">
                  <td colSpan={2}>Totales</td>
                  <td>{totalsTable1.forecast}</td>
                  <td>{totalsTable1.received}</td>
                  <td>{deviationTotal}</td>
                  <td>{percentDeviationTotal}%</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABLA 2 */}
          <button
            onClick={() => copyTableAsImage(table2Ref)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm mb-4"
          >
            Copiar Tabla CCR
          </button>

          <div ref={table2Ref} className="overflow-x-auto">
            <table className="mx-auto min-w-[70vw] border text-sm">
              <thead className="bg-primary">
                <tr>
                  <th>{`Contact Reason - ${selectedTeam}`}</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {accumulatedReasons.map((r, i) => (
                  <tr key={i} className="border-t *:py-2">
                    <td className="px-3 py-1">{r.contact_reason}</td>
                    <td className="text-center">{r.count}</td>
                  </tr>
                ))}
                <tr className="bg-primary font-semibold">
                  <td className="px-3 py-1">Total</td>
                  <td className="text-center">{totalContactsReasons}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
