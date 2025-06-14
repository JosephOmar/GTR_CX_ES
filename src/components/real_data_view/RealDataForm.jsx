import React, { useState, useEffect } from "react";

const UploadForm = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const requiredFiles = [
    { label: "Planned Data", expectedPart: "planned_data" },
    { label: "Assembled Call", expectedPart: "assembled_call" },
    { label: "Talkdesk", expectedPart: "talkdesk" },
    { label: "SAT Customer", expectedPart: "sat_customer" },
    { label: "SAT Customer Total", expectedPart: "sat_customer_total" },
    { label: "SAT Rider", expectedPart: "sat_rider" },
    { label: "SAT Rider Total", expectedPart: "sat_rider_total" },
    { label: "Real Agents", expectedPart: "real_agents" },
    { label: "Looker Customer", expectedPart: "looker_customer" },
    { label: "Looker Rider", expectedPart: "looker_rider" },
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
        clearInterval(interval); 
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
        setMessage(
          `❌ El archivo para "${requiredFiles[i].label}" debe contener: "${expected}"`
        );
        return;
      }

      formData.append(key, file);
    }

    setIsLoading(true);
    setMessage("");
    const interval = simulateProgress();

    try {
      const response = await fetch(
        "https://gtr-glovoes-cxpe.onrender.com/upload-real-data-view/",
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();
      setMessage(response.ok ? "✅ " + text : "❌ Error al subir: " + text);
    } catch (err) {
      setMessage("❌ Error de red: " + err.message);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0); // Oculta barra al terminar
      }, 1000);
    }
  };

  const getDynamicUrl = (fileLabel) => {
    const currentDate = new Date();
    
    // Formatear la fecha actual
    const formattedDate = `${currentDate.getFullYear()}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getDate().toString().padStart(2, "0")}`;
    const formattedIsoDate = currentDate.toISOString();  
  
    const startFormattedDate = formattedIsoDate.split('T')[0] + 'T00:00';  
    const endFormattedDate = formattedIsoDate.split('T')[0] + 'T23:59';  
  
    const baseUrls = {
      'Looker Rider': `https://glovoapp2.cloud.looker.com/dashboards/7420?Time+Granularity=30min&Created+Date=${formattedDate}&Channel=&User+Type=courier&Contact+Type=agent%2Cpartial&Country+Code=ES&Hub=Webhelp+Lima&Queue+Display+Name=Spain+Glovers+Chat`,
      'Assembled Call': `https://app.assembledhq.com/reports/forecasted-vs-actual?channel=phone&start=${startFormattedDate}&end=${endFormattedDate}&queue=spainpartner-1710492370&site=es-1692892007&schedule_id=97442917-98a8-43c2-8d9f-c2831e91d111&graph_type=contacts_received&preset_range=custom`,
      'Looker Customer': `https://glovoapp2.cloud.looker.com/dashboards/7420?Time+Granularity=30min&Contact+Type=agent%2Cpartial&Created+Date=${formattedDate}&User+Type=customer&Channel=&Country+Code=ES&Queue+Display+Name=Spain+Customers+Chat%2CIdentity+verification+and+Payment+Spain%2CRemove+from+Queues%2CB2B+customer+chats+ES%2CSpain+Customer+Snapcall&Hub=Webhelp+Lima`,
      'SAT Rider': `https://glovo.kustomerapp.com/app/reporting/satisfaction?start=${startFormattedDate}&end=${endFormattedDate}&rFilters=6839e5a73baacba6e88ab00c&surveyId=6525ac95ad36a557f06daa1a&tabName=summary&tz=Europe%2FMadrid`,
      'SAT Customer': `https://glovo.kustomerapp.com/app/reporting/satisfaction?start=${startFormattedDate}&end=${endFormattedDate}&rFilters=6839e58f8fe23f5934ed66c0&surveyId=6525ac95ad36a557f06daa1a&tabName=summary&tz=Europe%2FMadrid`,
      'Talkdesk': `https://glovoapp.mytalkdesk.com/atlas/apps/explore`,
      'Real Agents': `https://docs.google.com/spreadsheets/d/1Vn37PL3qlMTb3rtmOYs94sMYrqAWZnCvj2A56Z18D0M/edit?resourcekey=&gid=937237434#gid=937237434`
    };
  
    return baseUrls[fileLabel] || "";
  };

  return (
    <div className="flex justify-center w-full h-full">
      <div className="flex flex-col items-center mt-5">
        <a
          href="https://gtr-cx-glovo-es.netlify.app/real-data-view"
          className="text-center px-6 py-3 rounded-full bg-[#00A082] text-white border-black font-semibold"
        >
          Return View
        </a>
        <div className="p-6 bg-white rounded-xl shadow-md max-w-2xl mt-10 w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📤 Subir Archivos Excel
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {requiredFiles.map((file, index) => (
              <div key={file.label} className="mb-4">
                <div className="flex items-center gap-4">
                  <label className="block text-gray-700 font-semibold mb-1">
                    {file.label}
                  </label>
                  {(file.label === "Looker Rider" ||
                    file.label === "Assembled Call" ||
                    file.label === 'Looker Customer' ||
                    file.label === 'SAT Rider' ||
                    file.label === 'SAT Customer' ||
                    file.label === 'Talkdesk' ||
                    file.label === 'Real Agents' ) && (
                    <a
                      href={getDynamicUrl(file.label)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Link
                    </a>
                  )}
                </div>
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
              {isLoading ? "Subiendo..." : "Upload Files"}
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
            <p className="mt-4 text-center text-sm font-medium text-red-600">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
