import React from 'react';

export function SearchFilter({ search, setSearch }) {
  return (
    <div>
      <label className="block mb-1">Search by name:</label>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border-gray-300 rounded px-2 py-1 focus:ring-indigo-500"
        placeholder="Write the name..."
      />
    </div>
  );
}
