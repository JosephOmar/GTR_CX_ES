import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas-pro';  // Importa html2canvas-pro
import { toUnicodeBold } from '../management/utils/toUnicodeBold';

const CustomerProductionTable = () => {
  const [data, setData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');  // Estado para la fecha seleccionada
  const [selectedHourRanges, setSelectedHourRanges] = useState([]);  // Estado para los tramos seleccionados
  const [isLoading, setIsLoading] = useState(false);  // Estado para mostrar si está cargando los datos
  const [lowProductionFilter, setLowProductionFilter] = useState(false);  // Estado para el filtro de baja producción
  const tableRef = useRef(null)

  // Lista de tramos de 00:00 a 23:00
  const hourRanges = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
    '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  // Esta función se ejecuta cuando el usuario selecciona una fecha
  const handleDateChange = (event) => {
    console.log('xdddddd')
    setSelectedDate(event.target.value);
  };

  // Esta función se ejecuta cuando se seleccionan o deseleccionan tramos
  const handleHourRangeToggle = (range) => {
    setSelectedHourRanges((prevRanges) => {
      if (prevRanges.includes(range)) {
        return prevRanges.filter((r) => r !== range);  // Si ya está seleccionado, lo deseleccionamos
      } else {
        if (prevRanges.length >= 2) {
          // Si hay 2 tramos seleccionados, eliminamos el más antiguo
          return [...prevRanges.slice(1), range];
        }
        return [...prevRanges, range];  // Si no está seleccionado, lo añadimos
      }
    });
  };

  // Función que realiza el fetch de datos
  const fetchData = async () => {
    if (selectedDate) {
      setIsLoading(true);  // Activamos el estado de carga
      try {
        console.log('Fetching data for date:', selectedDate);
        const response = await fetch(`${import.meta.env.PUBLIC_URL_BACKEND}get-from-sheets-customer?date=${selectedDate}`);
        const data = await response.json();
        console.log('Datos obtenidos:', data);  // Log para verificar los datos que obtenemos
        setData(data.agentData);  // Solo trabajamos con agentData
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);  // Desactivamos el estado de carga
      }
    }
  };

  // Función para filtrar los datos dentro de un rango de horas
  const getFullRangeData = (selectedRanges) => {
    // Si no hay rangos seleccionados, retorna todos los tramos
    if (selectedRanges.length === 0) return hourRanges;

    // Encontrar el rango mínimo y máximo de horas seleccionadas
    const startHour = Math.min(...selectedRanges.map(hour => parseInt(hour.split(':')[0])));
    const endHour = Math.max(...selectedRanges.map(hour => parseInt(hour.split(':')[0])));

    // Crear un array con todos los tramos entre las horas seleccionadas
    let fullRange = [];
    for (let i = startHour; i <= endHour; i++) {
      fullRange.push(`${i < 10 ? '0' : ''}${i}:00`);
    }
    return fullRange;
  };

  // Filtrar los agentes que tienen producción mayor que 0 en al menos uno de los tramos seleccionados
  const filteredData = data
    ? Object.keys(data).reduce((acc, agent) => {
        const agentData = data[agent];
        
        // Verificar si el agente tiene producción en los tramos seleccionados
        const hasProductionInSelectedTramos = selectedHourRanges.some((range) => {
          // Comprobamos si la hora existe en los datos del agente
          const timeKey = `${range}`;
          if (agentData.hasOwnProperty(timeKey)) {
            return agentData[timeKey] > 0;  // Comprobar si existe el tramo en los datos
          }
          return false;
        });

        if (hasProductionInSelectedTramos) {
          // Si se aplica el filtro de baja producción, filtrar los datos
          if (lowProductionFilter) {
            // Solo incluir agentes con valores menores a 12 en los tramos seleccionados
            const hasLowProduction = selectedHourRanges.some((range) => {
              const timeKey = `${range}`;
              return agentData[timeKey] < 12;
            });
            if (hasLowProduction) {
              acc[agent] = agentData;
            }
          } else {
            // Si no hay filtro, añadir todos los agentes con producción
            acc[agent] = agentData;
          }
        }
        return acc;
      }, {})
    : {};

  console.log('Datos filtrados:', filteredData);  // Log para verificar los datos después de ser filtrados

  // Filtrar los tramos según la selección del usuario
  const filteredTramos = getFullRangeData(selectedHourRanges);  // Usamos la función que da los tramos completos

  // Función para obtener el fondo rojo para valores menores a 12
  const getBgColor = (value) => {
    return value < 12 ? 'bg-red-300' : 'bg-green-500';
  };

  // Filtrar tramos con valores 0 (no mostrarlos)
  const nonZeroTramos = (agentData) => {
    return Object.keys(agentData).filter(hour => agentData[hour] > 0);
  };

  // Copiar la tabla como imagen
  const handleCopyTableAsImage = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        canvas.toBlob((blob) => {
          const item = new ClipboardItem({
            "image/png": blob,
          });
          navigator.clipboard.write([item]);
        });
      });
    }
  };

  // Copiar el texto detallado de un rango seleccionado
  const handleCopyTextForRange = () => {
    if (selectedHourRanges.length === 1) {
      const hourRange = selectedHourRanges[0];
      const agentsInRange = Object.keys(filteredData).filter((agent) => {
        return filteredData[agent][hourRange] > 0;
      });
      const objetivo = agentsInRange.length * 12;
      const resultado = agentsInRange.reduce((sum, agent) => sum + filteredData[agent][hourRange], 0);
      const compliance = (resultado / objetivo) * 100;
      const debajoDeMeta = agentsInRange.filter(agent => filteredData[agent][hourRange] < 12).length;

      const emojiforCompliance = (compliance < 100) ? '🚨' : '🌟'

      const text = `${toUnicodeBold(`Detalle del rango ${hourRange} Hrs. - Customer Tier2`)}\n\n` +
        `  🎯 Objetivo: ${objetivo} correos\n` +
        `  📈 Resultado: ${resultado} correos gestionados\n` +
        `  ${emojiforCompliance} Cumplimiento: ${compliance.toFixed(1)}% del objetivo\n` +
        `  ⚠️ ${debajoDeMeta} asesores quedaron por debajo de la meta.`;

      // Copiar al portapapeles
      navigator.clipboard.writeText(text).then(() => {
        console.log('Texto copiado al portapapeles');
      }).catch(err => {
        console.error('Error al copiar el texto: ', err);
      });
    }
  };

  return (
    <div>
      <h1>Producción por Agente</h1>

      {/* Input de fecha */}
      <input 
        type="date" 
        value={selectedDate}
        onChange={handleDateChange}
      />

      {/* Botonera para seleccionar tramos */}
      <div className="mt-4">
        {hourRanges.map((range) => (
          <button
            key={range}
            className={`mr-2 p-2 border ${selectedHourRanges.includes(range) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleHourRangeToggle(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Botón para obtener los datos */}
      <button 
        onClick={fetchData}
        className="mt-4 p-2 bg-green-500 text-white"
      >
        Obtener Datos
      </button>

      {/* Botón para activar/desactivar filtro de baja producción */}
      <div className="mt-4">
        <button 
          onClick={() => setLowProductionFilter(!lowProductionFilter)}
          className="p-2 bg-red-500 text-white"
        >
          {lowProductionFilter ? 'Mostrar Todos' : 'Mostrar Baja Producción'}
        </button>
      </div>

      {/* Botones para copiar la tabla y el texto del rango */}
      <div className="mt-4">
        <button 
          onClick={handleCopyTableAsImage}
          className="p-2 bg-yellow-500 text-white"
        >
          Copiar Tabla como Imagen
        </button>

        <button 
          onClick={handleCopyTextForRange}
          className="ml-2 p-2 bg-blue-500 text-white"
        >
          Copiar Detalle del Rango Seleccionado
        </button>
      </div>

      {/* Mostrar Cargando... mientras se obtienen los datos */}
      {isLoading ? (
        <p className="mt-4">Cargando...</p>
      ) : (
        // Tabla de resultados
        filteredData && Object.keys(filteredData).length > 0 ? (
          <table ref={tableRef} id="production-table" className="mt-6 table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2 w-[400px]">Agente</th>
                {filteredTramos.map((range) => (
                  <th key={range} className="border px-4 py-2 w-[100px]">{range}:00</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(filteredData).map((agent) => {
                const agentData = filteredData[agent];
                const nonZero = nonZeroTramos(agentData);  // Filtrar tramos con valor mayor a 0
                if (nonZero.length === 0) return null;  // No mostrar agentes sin producción

                return (
                  <tr key={agent}>
                    <td className="border px-4 py-2 w-[400px]">{agent}</td>
                    {filteredTramos.map((hourRange) => {
                      const production = agentData[`${hourRange}`] || 0;
                      return (
                        <td
                          key={hourRange}
                          className={`border px-4 py-2 text-center w-[100px] ${production > 0 ? getBgColor(production) : 'bg-transparent'}`}
                        >
                          {production > 0 ? production : ''}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="mt-4">No hay datos para mostrar.</p>
        )
      )}
    </div>
  );
};

export default CustomerProductionTable;
