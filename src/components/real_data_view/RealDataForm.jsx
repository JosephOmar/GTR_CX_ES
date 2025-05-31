import React, { useState, useEffect } from 'react';

const UploadForm = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const simulateProgress = () => {
    setProgress(0);
    let value = 0;
    const interval = setInterval(() => {
      value += Math.random() * 10;
      if (value >= 95) {
        clearInterval(interval); // Detenemos antes del 100% real
      }
      setProgress(Math.min(value, 95));
    }, 200);
    return interval;
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

      if (!file.name.toLowerCase().includes(expected)) {
        setMessage(`❌ El archivo para "${requiredFiles[i].label}" debe contener: "${expected}"`);
        return;
      }

      formData.append(key, file);
    }

    setIsLoading(true);
    setMessage('');
    const interval = simulateProgress();

    try {
      const response = await fetch('https://gtr-glovoes-cxpe.onrender.com/upload-real-data-view/', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      setMessage(response.ok ? '✅ ' + text : '❌ Error al subir: ' + text);
    } catch (err) {
      setMessage('❌ Error de red: ' + err.message);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0); // Oculta barra al terminar
      }, 1000);
    }
  };

  return (
    <div className="flex justify-center w-full h-full">
      <div className="flex flex-col items-center mt-5">
        <a href="https://gtr-cx-glovo-es.netlify.app/real-data-view" className="text-center px-6 py-3 rounded-full bg-[#00A082] text-white border-black font-semibold">Return View</a>
        <div className="p-6 bg-white rounded-xl shadow-md max-w-2xl mt-10 w-full">
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
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Subiendo...' : 'Upload Files'}
            </button>
          </form>

          {/* Barra de progreso */}
          {isLoading && (
            <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
              <div
                className="bg-blue-500 h-4 transition-all duration-200 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {message && (
            <p className="mt-4 text-center text-sm font-medium text-red-600">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
