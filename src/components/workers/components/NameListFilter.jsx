import React from 'react';

export function NameListFilter({ nameList, setNameList }) {
  return (
    <div>
      <label className="block mb-1">Search by agent list:</label>
      <textarea
        rows={6}
        value={nameList}
        onChange={e => setNameList(e.target.value)}
        className="w-full border-gray-300 rounded px-2 py-1 focus:ring-indigo-500"
        placeholder="Cristhofer Josue Panez Elguera (DYLAT)…"
      />
      <button
        type="button"
        onClick={() => setNameList('')}
        className="mt-2 px-3 py-1 glovo-blue-accent text-white rounded"
      >
        Clean List
      </button>
    </div>
  );
}
