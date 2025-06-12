import React from 'react';

interface Props { value: string; onChange: (val: string) => void; }
export const QueueFilter: React.FC<Props> = ({ value, onChange }) => (
  <div className="mt-4">
    <label className="mr-2">Filtrar por Cola:</label>
    <select className="p-2 border" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Seleccionar</option>
      <option value="Spain Glovers">CHAT RIDER</option>
      <option value="Spain Customers">CHAT CUSTOMER</option>
    </select>
  </div>
);
