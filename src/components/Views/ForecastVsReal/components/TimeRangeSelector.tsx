import React from 'react';
import { generateTimeOptions } from '../utils/time';

interface Props {
  selected: string[];
  onSelect: (time: string) => void;
}
export const TimeRangeSelector: React.FC<Props> = ({ selected, onSelect }) => (
  <div className="mt-4">
    <label className="mr-2">Seleccionar Rango Horario:</label>
    <div className="flex flex-wrap">
      {generateTimeOptions().map(time => (
        <button
          key={time}
          onClick={() => onSelect(time)}
          className={`p-2 border m-1 ${selected.includes(time) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >{time}</button>
      ))}
    </div>
  </div>
);
