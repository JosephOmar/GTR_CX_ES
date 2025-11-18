import React, { useState, useEffect } from 'react';

const VendorProductionTable = () => {
  const [data, setData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');  // Estado para la fecha seleccionada

  // Esta función se ejecuta cuando el usuario selecciona una fecha
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedDate) {
        try {
          const response = await fetch(`http://localhost:8000/get-from-sheets-vendor?date=${selectedDate}`);
          const data = await response.json();
          setData(data.agentData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [selectedDate]);  // Fetch data whenever selectedDate changes

  return (
    <div>
      <h1>Producción por Agente</h1>
      <input 
        type="date" 
        value={selectedDate}
        onChange={handleDateChange}
      />
      {data ? (
        <table>
          <thead>
            <tr>
              <th>Agente</th>
              <th>21:00 - 22:00</th>
              <th>22:00 - 23:00</th>
              {/* Agrega más tramos según lo necesites */}
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).map((agent) => (
              <tr key={agent}>
                <td>{agent}</td>
                <td>{data[agent]["21:00 - 22:00"] || 0}</td>
                <td>{data[agent]["22:00 - 23:00"] || 0}</td>
                {/* Agrega más tramos según lo necesites */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default VendorProductionTable;