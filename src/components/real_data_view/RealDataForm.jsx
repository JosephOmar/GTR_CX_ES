import React, { useState } from 'react';

const UploadForm = () => {
  const [message, setMessage] = useState('');

  // Etiquetas para mostrar al usuario + nombre real para validación de filename
  const requiredFiles = [
    { label: 'Planned Data', expectedPart: 'planned_data' },
    { label: 'Assembled Chat', expectedPart: 'assembled_chat' },
    { label: 'Assembled Call', expectedPart: 'assembled_call' },
    { label: 'SAT Customer', expectedPart: 'sat_customer' },
    { label: 'SAT Customer Total', expectedPart: 'sat_customer_total' },
    { label: 'SAT Rider', expectedPart: 'sat_rider' },
    { label: 'SAT Rider Total', expectedPart: 'sat_rider_total' },
    { label: 'Real Agents', expectedPart: 'real_agents' },
  ];

  const [files, setFiles] = useState({});

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: selectedFiles[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    for (let i = 0; i < requiredFiles.length; i++) {
      const key = `file${i + 1}`;
      const file = files[key];
      const expected = requiredFiles[i].expectedPart;

      if (!file) {
        setMessage(`❌ Falta el archivo: ${requiredFiles[i].label}`);
        return;
      }

      // Validación opcional: verificar que el nombre contenga la palabra clave esperada
      if (!file.name.toLowerCase().includes(expected)) {
        setMessage(`❌ El archivo para "${requiredFiles[i].label}" debe contener: "${expected}"`);
        return;
      }

      formData.append(key, file);
    }

    try {
      const response = await fetch('http://localhost:8000/upload-real-data-view/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('✅ ' + data.message);
      } else {
        const errorText = await response.text();
        setMessage('❌ Error al subir: ' + errorText);
      }
    } catch (err) {
      setMessage('❌ Error de red: ' + err.message);
    }
  };

  return (
    <div className="flex w-full h-full">
      <div className="m-auto p-6 bg-white rounded-xl shadow-md max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📤 Subir Archivos Excel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {requiredFiles.map((file, index) => (
            <div key={file.label} className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">{file.label}</label>
              <input
                type="file"
                name={`file${index + 1}`}
                onChange={handleFileChange}
                className="w-full border border-gray-300 p-2 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
          >
            Upload Files
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default UploadForm;
