import React, { useState } from "react";
import FcstVsRealTable from "./FcstVsRealTable";
import UploadRealTimeModal from "./utils/UploadRealTimeModal";

export default function FcstVsRealTimePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    console.log("✅ Datos cargados correctamente");
    // Aquí podrías volver a llamar tu store Zustand para refrescar la tabla
  };

  return (
    <div className="p-6">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Subir Real-Time Data
      </button>

      <UploadRealTimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
      <FcstVsRealTable />
    </div>
  );        
}
