import { useState, useEffect, useRef } from "react";
import { useWorkersStore } from "../../../workers/store/WorkersStore";
import html2canvas from "html2canvas-pro";

function getLocalMidnight(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0);
}

function getLocalNextMidnight(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day + 1, 0, 0, 0);
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSpainTimeDifference() {
  const now = new Date();

  // Año actual
  const year = now.getUTCFullYear();

  // Último domingo de marzo (inicio del horario de verano)
  const marchLastSunday = new Date(Date.UTC(year, 2, 31));
  marchLastSunday.setUTCDate(marchLastSunday.getUTCDate() - marchLastSunday.getUTCDay());

  // Último domingo de octubre (fin del horario de verano)
  const octoberLastSunday = new Date(Date.UTC(year, 9, 31));
  octoberLastSunday.setUTCDate(octoberLastSunday.getUTCDate() - octoberLastSunday.getUTCDay());

  // Verificamos si estamos en horario de verano
  const nowUTC = now.getTime();
  const inSummerTime = nowUTC >= marchLastSunday.getTime() && nowUTC < octoberLastSunday.getTime();

  // España: UTC+2 en verano, UTC+1 en invierno
  const spainOffset = inSummerTime ? 2 : 1;
  const limaOffset = -5;

  // Diferencia entre el horario de España y Perú (España - Perú)
  const diff = spainOffset - limaOffset; // Diferencia en horas

  return diff;
}

function getSpainMidnightInLocalTime(dateInPeru) {
  const timeDifference = getSpainTimeDifference();

  const date = new Date(dateInPeru); 

  date.setHours(date.getHours() - timeDifference); 

  return date;
}


// Componente principal
const AttendanceTable = () => {
  const { workers, loading, error, fetchWorkers } = useWorkersStore();
  const today = new Date();
  const [dateFilter, setDateFilter] = useState(formatLocalDate(today));
  const [teamFilter, setTeamFilter] = useState(""); // Filtro de equipo
  const [filteredData, setFilteredData] = useState([]);
  const [teamOptions, setTeamOptions] = useState([
    "CUSTOMER TIER1",
    "CUSTOMER TIER2",
    "RIDER TIER1",
    "RIDER TIER2",
    "VENDOR TIER1",
    "VENDOR TIER2",
  ]);

  const [selectedHours, setSelectedHours] = useState([]); // Horas seleccionadas
  const tableRef = useRef(null); // Referencia a la tabla

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
  };

  // Cargar los trabajadores solo si no están cargados
  useEffect(() => {
    if (workers.length === 0) {
      fetchWorkers();
    }
  }, [workers.length, fetchWorkers]);

  // Filtrar los datos según los filtros (fecha, equipo, horas seleccionadas)
  useEffect(() => {
    if (workers.length > 0) {
      filterData();
    }
  }, [workers, dateFilter, teamFilter, selectedHours]);

  // Filtrar por fecha y equipo (basado en hora España)
  const filterData = () => {
    const peruMidnight = getLocalMidnight(dateFilter);
    const peruNextMidnight = getLocalNextMidnight(dateFilter);

    // Convertir esos límites a tu rango real (de medianoche España en hora Perú)
    const peruStart = getSpainMidnightInLocalTime(peruMidnight);
    const peruEnd = getSpainMidnightInLocalTime(peruNextMidnight);

    const filtered = workers.filter((worker) => {
      const teamName = worker.team?.name || "";
      if (worker.productive !== "Si") return false;
      if (!teamOptions.includes(teamName)) return false;
      if (teamFilter && teamName !== teamFilter) return false;

      const schedules = worker.schedules;
      if (!Array.isArray(schedules) || schedules.length === 0) return false;

      const hasScheduleInRange = schedules.some((schedule) => {
        if (!schedule.date || !schedule.start_time) return false;

        const scheduleDateTime = new Date(`${schedule.date}T${schedule.start_time}`);
        return scheduleDateTime >= peruStart && scheduleDateTime < peruEnd;
      });

      return hasScheduleInRange;
    });

    setFilteredData(filtered);
  };

  // Comprobar si la hora está dentro del rango de horas seleccionadas
  const isTimeInRange = (timeInMinutes) => {
    if (selectedHours.length < 2) return false;

    const [startTime, endTime] = selectedHours.map((t) => {
      const [hour, minute] = t.split(":").map(Number);
      return hour * 60 + minute; // Convertir a minutos
    });

    return timeInMinutes >= startTime && timeInMinutes <= endTime;
  };

  // ✅ Procesar los datos para la tabla
  const processTableData = () => {
    const tableData = [];

    const peruMidnight = getLocalMidnight(dateFilter);
    const peruEquivalent = getSpainMidnightInLocalTime(peruMidnight);

    // Convertir las horas seleccionadas a minutos para comparación fácil
    const selectedHoursInMinutes = selectedHours.map((time) => {
      const [hour, minute] = time.split(":").map(Number);
      return hour * 60 + minute; // Convertir a minutos
    });

    for (let i = 0; i < 48; i++) {
      const dateInPeruIter = new Date(peruEquivalent.getTime() + i * 30 * 60 * 1000);
      const dateInSpainIter = new Date(
        dateInPeruIter.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
      );

      const startTimePeru = dateInPeruIter;
      const endTimePeru = new Date(dateInPeruIter.getTime() + 30 * 60 * 1000);

      // 1️⃣ Contar schedules en la franja
      const schedulesInRange = [];

      filteredData.forEach((worker) => {
        const validSchedules = worker.schedules.filter((schedule) => {
          if (!schedule.date || !schedule.start_time) return false;
          const scheduleDateTime = new Date(`${schedule.date}T${schedule.start_time}`);
          if (scheduleDateTime >= startTimePeru && scheduleDateTime < endTimePeru) {
            schedulesInRange.push({ worker, schedule });
            return true;
          }
          return false;
        });
      });

      const scheduleCount = schedulesInRange.length;

      // 2️⃣ Contar attendance por estado, basándose en los schedules encontrados
      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;

      schedulesInRange.forEach(({ worker, schedule }) => {
        const workerAttendances = worker.attendances?.filter(
          (att) =>
            att.api_email === worker.api_email &&
            att.date === schedule.date
        ) || [];

        // Si no tiene attendance → lo consideramos "Absent"
        if (workerAttendances.length === 0) {
          absentCount++;
          return;
        }

        // Buscamos si tiene "Late" o "Present"
        const hasLate = workerAttendances.some((att) => att.status === "Late");
        const hasPresent = workerAttendances.some((att) => att.status === "Present");

        if (hasLate) lateCount++;
        else if (hasPresent) presentCount++;
        else absentCount++; // fallback, por si hay otro estado no previsto
      });

      // 3️⃣ Agregar fila solo si la hora seleccionada está en el rango
      const hourSpain = dateInSpainIter.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Convertir la hora de España a minutos
      const [hour, minute] = hourSpain.split(":").map(Number);
      const timeInMinutes = hour * 60 + minute;

      // Verificar si la hora está dentro del rango seleccionado
      if (isTimeInRange(timeInMinutes)) {
        tableData.push({
          hourPeru: dateInPeruIter.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          hourSpain: hourSpain,
          schedule: scheduleCount,
          present: presentCount,
          late: lateCount,
          absent: absentCount,
        });
      }
    }

    return tableData;
  };

  // Función para copiar la tabla al portapapeles
  const handleCopyTableToClipboard = () => {
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

  const handleHourSelection = (hour) => {
    let updatedHours = [...selectedHours];

    // Si la hora ya está seleccionada, la eliminamos
    if (updatedHours.includes(hour)) {
      updatedHours = updatedHours.filter((h) => h !== hour);
    } else {
      // Si ya hay 2 horas seleccionadas, eliminamos la primera
      if (updatedHours.length >= 2) updatedHours.shift();
      updatedHours.push(hour);
    }

    setSelectedHours(updatedHours);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Attendance Tracker</h2>

      {/* Filtros */}
      <div className="mb-4">
        <label className="mr-2">Fecha (Hora España):</label>
        <input
          type="date"
          value={dateFilter}
          onChange={handleDateChange}
          className="p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="mr-2">Team:</label>
        <select
          onChange={(e) => setTeamFilter(e.target.value)}
          value={teamFilter}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Todos</option>
          {teamOptions.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de horas */}
      <div className="mb-4">
        <label className="mr-2">Horas:</label>
        <div className="flex flex-wrap">
          {Array.from({ length: 48 }, (_, i) => {
            const hour = String(Math.floor(i / 2)).padStart(2, "0");
            const minute = i % 2 === 0 ? "00" : "30";
            const time = `${hour}:${minute}`;
            return (
              <button
                key={time}
                className={`p-2 m-1 border rounded ${
                  selectedHours.includes(time) ? "bg-blue-500 text-white" : "bg-white"
                }`}
                onClick={() => handleHourSelection(time)}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* Copiar tabla */}
      <button
        onClick={handleCopyTableToClipboard}
        className="mb-4 p-2 bg-green-500 text-white rounded"
      >
        Copiar tabla al portapapeles
      </button>

      {/* Encabezado */}
      {teamFilter && <h3 className="text-lg font-semibold mb-4">{teamFilter} Attendance</h3>}

      {/* Tabla */}
      <table ref={tableRef} className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b">Perú Time</th>
            <th className="px-4 py-2 border-b">Spain Time</th>
            <th className="px-4 py-2 border-b">Scheduled</th>
            <th className="px-4 py-2 border-b">Present</th>
            <th className="px-4 py-2 border-b">Late</th>
            <th className="px-4 py-2 border-b">Absent</th>
          </tr>
        </thead>
        <tbody>
          {processTableData().map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{row.hourPeru}</td>
              <td className="px-4 py-2 border-b">{row.hourSpain}</td>
              <td className="px-4 py-2 border-b">{row.schedule}</td>
              <td className="px-4 py-2 border-b">{row.present}</td>
              <td className="px-4 py-2 border-b">{row.late}</td>
              <td className="px-4 py-2 border-b">{row.absent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
