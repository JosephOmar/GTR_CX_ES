import { useState } from "react";

export default function SendButton({ chanel, agentes, training, others }) {
  const [send, setSend] = useState(false);

  const handleSubmit = async () => {
    setSend(true);
    const backendUrl = `${import.meta.env.PUBLIC_URL_BACKEND}send-to-sheets`;

    const payload = {
      Chanel: chanel,
      Agents: agentes,
      Training: training,
      Others: others,
    };

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error en el servidor");
      const data = await response.json();

      setTimeout(() => setSend(false), 10);
    } catch (error) {
      console.error("❌ Error al enviar datos:", error);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <button
        onClick={handleSubmit}
        className={`mt-4 px-4 py-2 rounded transition duration-200 focus:outline-none ${
          send ? "bg-green-500" : "bg-[#cbe2f7] hover:bg-[#509ee3]"
        }`}
      >
        {send ? "📬 sent" : "✉️ send"}
      </button>
    </div>
  );
}
