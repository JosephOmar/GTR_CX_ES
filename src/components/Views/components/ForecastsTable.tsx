import React from "react";
import type { ForecastItem, Totals } from "../types/types";

interface Props {
  data: ForecastItem[];
  totals: Totals;
}
export const ForecastsTable: React.FC<Props> = ({ data, totals }) => (
  <table id="data-table" className="min-w-full table-auto border-collapse mt-4 glovo-yellow border-black">
    <thead>
      <tr className="glovo-green *:text-white">
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
        <tr key={i} className={`*:text-center ${i%2==0 ? 'glovo-yellow' : 'glovo-yellow-accent'}`}>
          <td className="border p-2">{r.date}</td>
          <td className="border p-2">{r.time}</td>
          <td className="border p-2">
            {r.queue === "Spain Customers"
              ? "Chat Customer"
              : r.queue === "Spain Glovers"
              ? "Chat Rider"
              : "Call Vendors"}
          </td>
          <td className={`border p-2 ${
              r.sla! < 86 ? "bg-red-700" : r.sla! < 91 ? "bg-orange-700" : "bg-green-700"
            } text-white`}>{Number(r.sla) ? `${r.sla.toFixed(2)}%` : '-'}</td>
          <td className="border p-2">{r.forecasted}</td>
          <td className="border p-2">{r.actual}</td>
          <td
            className={`border p-2 ${
              r.desvio! > 0 ? "bg-red-700" : r.desvio! < 0 ? "bg-green-700" : "bg-orange-700"
            } text-white`}
          >
            {r.desvio!.toFixed(0)}
          </td>
          <td
            className={`border p-2 ${
              r.desvioPercentage! > 0 ? "bg-red-700" : r.desvioPercentage! < 0 ? "bg-green-700" : "bg-orange-700"
            } text-white`}
          >
            {r.desvioPercentage!.toFixed(2)}%
          </td>
          <td
            className={`border p-2 ${
              r.aht >= 420 && r.queue === "Spain Customers"
                ? "bg-red-700"
                : r.aht >= 180 && r.queue === "Spain Glovers"
                ? "bg-red-700"
                : r.aht >= 200 && r.queue === "Spain Partners"
                ? "bg-red-700"
                : "bg-green-700"
            } text-white`}
          >
            {r.aht}
          </td>
        </tr>
      ))}
      {/* fila de totales */}
      <tr className="*:text-center glovo-green text-white">
        <td colSpan={3} className="border p-2 text-center">
          Totales
        </td>
        <td className="border p-2">{totals.slaTotal.toFixed(1)}%</td>
        <td className="border p-2">{totals.forecastedTotal.toFixed(0)}</td>
        <td className="border p-2">{totals.actualTotal.toFixed(0)}</td>
        <td
          className={`border p-2`}
        >
          {totals.desvioTotal.toFixed(0)}
        </td>
        <td
          className={`border p-2`}
        >
          {((totals.desvioTotal / totals.forecastedTotal) * 100).toFixed(2)}%
        </td>
        <td
          className={`border p-2`}
        >
          {totals.ahtTotal.toFixed(0)}
        </td>
      </tr>
    </tbody>
  </table>
);
