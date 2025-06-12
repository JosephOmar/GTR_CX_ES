import React from "react";
import type { ForecastItem, Totals } from "../types/types";

interface Props {
  data: ForecastItem[];
  totals: Totals;
}
export const ForecastsTable: React.FC<Props> = ({ data, totals }) => (
  <table id="data-table" className="min-w-full table-auto border-collapse mt-4">
    <thead>
      <tr className="bg-glovo-green *:text-white">
        <th className="border p-2">Date</th>
        <th className="border p-2">Interval</th>
        <th className="border p-2">Team</th>
        <th className="border p-2">SLA</th>
        <th className="border p-2">Forecasted</th>
        <th className="border p-2">Actual</th>
        <th className="border p-2">Deviation</th>
        <th className="border p-2">Deviation (%)</th>
        <th className="border p-2">AHT (s)</th>
      </tr>
    </thead>
    <tbody>
      {data.length === 0 && (
        <tr>
          <td colSpan={8} className="border p-2 text-center">
            No hay datos disponibles.
          </td>
        </tr>
      )}
      {data.map((r, i) => (
        <tr key={i}>
          <td className="border p-2">{r.date}</td>
          <td className="border p-2">{r.time}</td>
          <td className="border p-2">
            {r.queue === "Spain Customers" ? "Chat Customer" : "Chat Rider"}
          </td>
          <td className="border p-2">{r.sla.toFixed(2)}%</td>
          <td className="border p-2">{r.forecasted}</td>
          <td className="border p-2">{r.actual}</td>
          <td
            className={`border p-2 ${
              r.desvio! >= 0 ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            {r.desvio!.toFixed(2)}
          </td>
          <td
            className={`border p-2 ${
              r.desvioPercentage! >= 0 ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            {r.desvioPercentage!.toFixed(2)}%
          </td>
          <td
            className={`border p-2 ${
              r.aht >= 0 ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            {r.aht}
          </td>
        </tr>
      ))}
      {/* fila de totales */}
      <tr>
        <td colSpan={3} className="border p-2 text-center">
          Totales
        </td>
        <td className="border p-2">{totals.slaTotal.toFixed(2)}%</td>
        <td className="border p-2">{totals.forecastedTotal.toFixed(2)}</td>
        <td className="border p-2">{totals.actualTotal.toFixed(2)}</td>
        <td
          className={`border p-2 ${
            totals.desvioTotal >= 0 ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {totals.desvioTotal.toFixed(2)}
        </td>
        <td
          className={`border p-2 ${
            (totals.desvioTotal / totals.forecastedTotal) >= 0 ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {((totals.desvioTotal / totals.forecastedTotal)*100).toFixed(2)}%
        </td>
        <td
          className={`border p-2 ${
            totals.desvioTotal >= 0 ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {totals.ahtTotal.toFixed(0)}
        </td>
      </tr>
    </tbody>
  </table>
);
