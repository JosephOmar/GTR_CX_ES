import React from 'react';
import { getTodayDay } from '../utils/scheduleUtils';

export function TeamDayTimeFilter({
  teamFilter, setTeamFilter,
  selectedDay, setSelectedDay,
  timeFilter, setTimeFilter,
}) {
  const DAYS = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];
  const dayOptions = DAYS.map(d => ({
    label: d === getTodayDay() ? `${d} (Hoy)` : d,
    value: d
  }));
  const teamOptions = [
    { label: 'Todas', value: '' },
    { label: 'Chat Customer', value: 'CHAT CUSTOMER' },
    { label: 'Chat Rider',    value: 'CHAT RIDER' },
    { label: 'Call Vendors',  value: 'CALL VENDORS' },
    { label: 'Mail Vendors',  value: 'MAIL VENDORS' },
    { label: 'Mail Rider',    value: 'MAIL RIDER' },
    { label: 'Mail Customer / IS', value: 'MAIL_CUSTOMER_GROUP' },
    { label: 'Vendors (Call + Mail)', value: 'VENDORS_GROUP' },
  ];
  const timeSlots = [];
  for (let h = 0; h < 24; h++) ['00','30'].forEach(m =>
    timeSlots.push(`${String(h).padStart(2,'0')}:${m}`)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block mb-1">Filtrar por Team:</label>
        <select
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
          className="w-full border-gray-300 rounded px-2 py-1 focus:ring-indigo-500"
        >
          {teamOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Filtrar por Día:</label>
        <select
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          className="w-full border-gray-300 rounded px-2 py-1 focus:ring-indigo-500"
        >
          {dayOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Filtrar por Hora:</label>
        <select
          value={timeFilter}
          onChange={e => setTimeFilter(e.target.value)}
          className="w-full border-gray-300 rounded px-2 py-1 focus:ring-indigo-500"
        >
          <option value="">Todas</option>
          {timeSlots.map(ts => (
            <option key={ts} value={ts}>{ts}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
