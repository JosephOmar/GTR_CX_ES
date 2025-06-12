import React from 'react';
import { expandOvernight } from '../utils/scheduleUtils';

export function WorkersTable({ workers, selectedDay }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {["Documento","Nombre","Team","Supervisor","Coordinador","Link Kustomer","Nombre Kustomer","Tipo Contrato","Horario(s)"]
              .map((h,i) => (
                <th key={i} className="px-2 py-2 text-left font-medium text-gray-700">
                  {h}
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {workers.map(w => {
            const turns = w.contract_type?.name === 'UBYCALL'
              ? w.ubycall_schedules
              : w.schedules;
            const slots = expandOvernight(turns)
              .filter(f => f.day === selectedDay)
              .map((f,i) => (
                <div key={i}>
                  {f.start && f.end
                    ? `${f.start} - ${f.end}`
                    : <em>Descanso</em>}
                </div>
              ));
            const rowSupervisor = w.role?.name === 'SUPERVISOR' ? 'bg-[#20e3cd]' : '';
            const rowMigration = w.observation_1 === 'MIGRACION' ? 'bg-[#FFC244]' : '';
            return (
              <tr key={w.document} className={`${rowSupervisor} ${rowMigration}`}>
                <td className="px-2 py-1">{w.document}</td>
                <td className="px-2 py-1">{w.name}</td>
                <td className="px-2 py-1">{w.team?.name}</td>
                <td className="px-2 py-1">{w.supervisor}</td>
                <td className="px-2 py-1">{w.coordinator}</td>
                <td className="px-2 py-1">
                  {w.kustomer_id
                    ? <a href={`https://glovo.kustomerapp.com/app/users/status?u=${w.kustomer_id}`}
                         target="_blank" rel="noopener noreferrer" className="text-indigo-600">
                        Link
                      </a>
                    : '—'}
                </td>
                <td className="px-2 py-1">{w.kustomer_name || '—'}</td>
                <td className="px-2 py-1">{w.contract_type?.name || '—'}</td>
                <td className="px-2 py-1">
                  {slots.length ? slots : <em>Sin horario</em>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
