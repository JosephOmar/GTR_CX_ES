import React from 'react';

interface Props { onFileSelected: (file: File) => void; }
export const FileUploader: React.FC<Props> = ({ onFileSelected }) => (
  <input
    type="file"
    accept=".csv"
    onChange={e => e.target.files?.[0] && onFileSelected(e.target.files[0])}
    className="border p-2"
  />
);
