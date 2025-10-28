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
  const year = now.getUTCFullYear();
  const marchLastSunday = new Date(Date.UTC(year, 2, 31));
  marchLastSunday.setUTCDate(
    marchLastSunday.getUTCDate() - marchLastSunday.getUTCDay()
  );

  const octoberLastSunday = new Date(Date.UTC(year, 9, 31));
  octoberLastSunday.setUTCDate(
    octoberLastSunday.getUTCDate() - octoberLastSunday.getUTCDay()
  );

  const nowUTC = now.getTime();
  const inSummerTime =
    nowUTC >= marchLastSunday.getTime() && nowUTC < octoberLastSunday.getTime();

  const spainOffset = inSummerTime ? 2 : 1;
  const limaOffset = -5;

  const diff = spainOffset - limaOffset;
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
  const [teamFilter, setTeamFilter] = useState([]); // Filtro de equipo (selección múltiple)
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

  useEffect(() => {
    if (workers.length === 0) {
      fetchWorkers();
    }
  }, [workers.length, fetchWorkers]);

  useEffect(() => {
    if (workers.length > 0) {
      filterData();
    }
  }, [workers, dateFilter, teamFilter, selectedHours]);

  const filterData = () => {
    const peruMidnight = getLocalMidnight(dateFilter);
    const peruNextMidnight = getLocalNextMidnight(dateFilter);

    const peruStart = getSpainMidnightInLocalTime(peruMidnight);
    const peruEnd = getSpainMidnightInLocalTime(peruNextMidnight);

    const filtered = workers.filter((worker) => {
      const teamName = worker.team?.name || "";
      if (worker.productive !== "Si" ) return false;
      
      if (teamFilter.length > 0 && !teamFilter.includes(teamName)) return false;

      const schedules = worker.schedules;
      if (!Array.isArray(schedules) || schedules.length === 0) return false;

      const hasScheduleInRange = schedules.some((schedule) => {

        if (schedule.obs && schedule.obs !== "FLT" && schedule.obs !== null) {
                return false; // Excluir este horario si no es "FLT" o NULL
        }
        
        if (!schedule.date || !schedule.start_time || !schedule.end_time)
          return false;

        const scheduleStartTime = new Date(
          `${schedule.date}T${schedule.start_time}`
        );
        let scheduleEndTime = new Date(`${schedule.date}T${schedule.end_time}`);
        if (scheduleEndTime < scheduleStartTime) {
          scheduleEndTime.setDate(scheduleEndTime.getDate() + 1); // Sumar un día
        }
        return scheduleStartTime < peruEnd && scheduleEndTime > peruStart;
      });

      return hasScheduleInRange;
    });

    setFilteredData(filtered);
  };

  const isTimeInRange = (timeInMinutes) => {
    if (selectedHours.length < 2) return false;

    const [startTime, endTime] = selectedHours.map((t) => {
      const [hour, minute] = t.split(":").map(Number);
      return hour * 60 + minute;
    });

    return timeInMinutes >= startTime && timeInMinutes <= endTime;
  };

  const processTableData = () => {
    const tableData = [];
    const peruMidnight = getLocalMidnight(dateFilter);
    const peruEquivalent = getSpainMidnightInLocalTime(peruMidnight);

    for (let i = 0; i < 48; i++) {
      const dateInPeruIter = new Date(
        peruEquivalent.getTime() + i * 30 * 60 * 1000
      );
      const dateInSpainIter = new Date(
        dateInPeruIter.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
      );
      const startTimePeru = dateInPeruIter;
      const endTimePeru = new Date(dateInPeruIter.getTime() + 30 * 60 * 1000);

      const schedulesInRange = [];
      const schedulesWorkingInRange = [];

      filteredData.forEach((worker) => {
        const validSchedules = worker.schedules.filter((schedule) => {
          const scheduleStartTime = new Date(
            `${schedule.date}T${schedule.start_time}`
          );
          let scheduleEndTime = new Date(
            `${schedule.date}T${schedule.end_time}`
          );
          if (scheduleEndTime < scheduleStartTime) {
            scheduleEndTime.setDate(scheduleEndTime.getDate() + 1);
          }
          if (
            scheduleStartTime < endTimePeru &&
            scheduleEndTime > startTimePeru
          ) {
            schedulesWorkingInRange.push({ worker, schedule });
            if (
              scheduleStartTime >= startTimePeru &&
              scheduleStartTime < endTimePeru
            ) {
              schedulesInRange.push({ worker, schedule });
            }
            return true;
          }
          return false;
        });
      });

      const incomeCount = schedulesInRange.length;
      const scheduleCount = schedulesWorkingInRange.length;

      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;

      schedulesInRange.forEach(({ worker, schedule }) => {
        const workerAttendances =
          worker.attendances?.filter(
            (att) =>
              att.api_email === worker.api_email && att.date === schedule.date
          ) || [];

        if (workerAttendances.length === 0) {
          absentCount++;
          return;
        }

        const hasLate = workerAttendances.some((att) => att.status === "Late");
        const hasPresent = workerAttendances.some(
          (att) => att.status === "Present"
        );

        if (hasLate) lateCount++;
        else if (hasPresent) presentCount++;
        else absentCount++;
      });

      let totalAbsentCount = 0;
      schedulesWorkingInRange.forEach(({ worker, schedule }) => {
        const workerAttendances =
          worker.attendances?.filter(
            (att) =>
              att.api_email === worker.api_email && att.date === schedule.date
          ) || [];

        if (workerAttendances.length === 0) {
          totalAbsentCount++;
          return;
        }
        const hasAbsent = workerAttendances.some(
          (att) => att.status === "Absent"
        );
        if (hasAbsent) totalAbsentCount++;
      });

      const hourSpain = dateInSpainIter.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const [hour, minute] = hourSpain.split(":").map(Number);
      const timeInMinutes = hour * 60 + minute;

      if (isTimeInRange(timeInMinutes)) {
        const rowData = {
          hourPeru: dateInPeruIter.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          hourSpain: hourSpain,
        };

        let absentCountByTeam = {};
        let totalAbsentCountByTeam = {};

        teamFilter.forEach((team) => {
          // Filtramos los schedules para obtener los valores de Scheduled e Income
          const Scheduled = schedulesWorkingInRange.filter(
            (entry) => entry.worker.team?.name === team
          ).length;
          const Income = schedulesInRange.filter(
            (entry) =>
              entry.worker.team?.name === team && entry.schedule.start_time
          ).length;

          // Calculamos absentCount por equipo
          let absentCount = 0;
          schedulesInRange.forEach(({ worker, schedule }) => {
            if (worker.team?.name === team) {
              const workerAttendances =
                worker.attendances?.filter(
                  (att) =>
                    att.api_email === worker.api_email &&
                    att.date === schedule.date
                ) || [];

              if (workerAttendances.length === 0) {
                absentCount++; // Incrementamos si el trabajador no tiene asistencia (ausente)
              }
            }
          });

          // Calculamos totalAbsentCount por equipo
          let totalAbsentCount = 0;
          schedulesWorkingInRange.forEach(({ worker, schedule }) => {
            if (worker.team?.name === team) {
              const workerAttendances =
                worker.attendances?.filter(
                  (att) =>
                    att.api_email === worker.api_email &&
                    att.date === schedule.date
                ) || [];

              if (workerAttendances.length === 0) {
                totalAbsentCount++; // Incrementamos si el trabajador no tiene asistencia (ausente)
              }
              const hasAbsent = workerAttendances.some(
                (att) => att.status === "Absent"
              );
              if (hasAbsent) totalAbsentCount++; // Aumentamos si está ausente
            }
          });

          // Asignamos estos valores a los objetos de absentCountByTeam y totalAbsentCountByTeam
          absentCountByTeam[team] = absentCount;
          totalAbsentCountByTeam[team] = totalAbsentCount;

          // Asignamos estos valores a la fila de la tabla
          rowData[`${team}Scheduled`] = Scheduled;
          rowData[`${team}Connected`] = Scheduled - totalAbsentCountByTeam[team];
          rowData[`${team}Income`] = Income;
          rowData[`${team}Absent`] = absentCountByTeam[team]; // Usamos el valor calculado por equipo
          rowData[`${team}TotalAbsent`] = totalAbsentCountByTeam[team]; // Usamos el valor calculado por equipo
        });

        tableData.push(rowData);
      }
    }

    return tableData;
  };

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
    if (updatedHours.includes(hour)) {
      updatedHours = updatedHours.filter((h) => h !== hour);
    } else {
      if (updatedHours.length >= 2) updatedHours.shift();
      updatedHours.push(hour);
    }

    setSelectedHours(updatedHours);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Attendance Tracker</h2>

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
          onChange={(e) => {
            const selectedTeams = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            );
            setTeamFilter(selectedTeams);
          }}
          value={teamFilter}
          multiple
          className="p-2 border border-gray-300 rounded"
        >
          {teamOptions.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

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
                  selectedHours.includes(time)
                    ? "bg-blue-500 text-white"
                    : "bg-white"
                }`}
                onClick={() => handleHourSelection(time)}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleCopyTableToClipboard}
        className="mb-4 p-2 bg-green-500 text-white rounded"
      >
        Copiar tabla al portapapeles
      </button>

      <div ref={tableRef} className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b"></th>
              <th className="px-4 py-2 border-b"></th>
              {teamFilter.map((team) => (
                <>
                  <th
                    colSpan="5"
                    key={`${team}-header`}
                    className="px-4 py-2 border-b text-center"
                  >
                    {team}
                  </th>
                </>
              ))}
            </tr>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">Perú Time</th>
              <th className="px-4 py-2 border-b">Spain Time</th>
              {teamFilter.map((team) => (
                <>
                  <th
                    key={`${team}Scheduled`}
                    className="px-4 py-2 border-b border-l border-black"
                  >
                    Scheduled
                  </th>
                  <th key={`${team}Connected`} className="px-4 py-2 border-b ">
                    Connected
                  </th>
                  <th key={`${team}Income`} className="px-4 py-2 border-b">
                    Income
                  </th>
                  <th key={`${team}Absent`} className="px-4 py-2 border-b">
                    Absent
                  </th>
                  <th key={`${team}TotalAbsent`} className="px-4 py-2 border-b">
                    Total Absent
                  </th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {processTableData().map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 *:text-center">
                <td className="px-4 py-2 border-b">{row.hourPeru}</td>
                <td className="px-4 py-2 border-b">{row.hourSpain}</td>
                {teamFilter.map((team) => (
                  <>
                    <td
                      key={`${team}Scheduled-${index}`}
                      className="px-4 py-2 border-b border-l border-black"
                    >
                      {row[`${team}Scheduled`]}
                    </td>
                    <td
                      key={`${team}Connected-${index}`}
                      className="px-4 py-2 border-b"
                    >
                      {row[`${team}Connected`]}
                    </td>
                    <td
                      key={`${team}Income-${index}`}
                      className="px-4 py-2 border-b"
                    >
                      {row[`${team}Income`]}
                    </td>
                    <td
                      key={`${team}Absent-${index}`}
                      className="px-4 py-2 border-b"
                    >
                      {row[`${team}Absent`]}
                    </td>
                    <td
                      key={`${team}TotalAbsent-${index}`}
                      className="px-4 py-2 border-b"
                    >
                      {row[`${team}TotalAbsent`]}
                    </td>
                  </>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
