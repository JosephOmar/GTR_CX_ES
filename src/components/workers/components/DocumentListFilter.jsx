import React from 'react';

export function DocumentListFilter({ documentList, setDocumentList }) {
  return (
    <div>
      <label className="block mb-1">Search by document list:</label>
      <textarea
        rows={6}
        value={documentList}
        onChange={e => setDocumentList(e.target.value)}
        className="w-full border-gray-300 rounded px-2 py-1 focus:ring-indigo-500"
        placeholder="45728085 73630835 47733084 75848507..."
      />
      <button
        type="button"
        onClick={() => setDocumentList('')}
        className="mt-2 px-3 py-1 glovo-blue-accent text-white rounded"
      >
        Clean List
      </button>
    </div>
  );
}
