import React, { useState } from 'react';
import { NameListFilter }    from './components/NameListFilter';
import { SearchFilter }      from './components/SearchFilter';
import { DocumentListFilter } from './components/DocumentListFilter';
import { TeamDayTimeFilter } from './components/TeamDayTimeFilter';
import { WorkersTable }      from './components/WorkersTable';
import { useWorkersWithFilters } from './hooks/useWorkersWithFilters';
import { LoadingOrError } from './components/LoadingOrError';
import UploadWorkersModal from './hooks/UploadWorkersModal';
import UploadSchedulesModal from './hooks/UploadSchedulesModal';
import UploadPlannedModal from './hooks/UploadPlannedModal';
import UploadAttendanceModal from './hooks/UploadAttendanceModal';

export default function WorkersWithSchedules() {
  const [search, setSearch] = useState('');
  const [nameList, setNameList] = useState('');
  const [nameList2, setNameList2] = useState('');
  const [nameList3, setNameList3] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [timeFilter, setTimeFilter] = useState([]);
  const [exactStart, setExactStart] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [observation1Filter, setObservation1Filter] = useState('');
  const [observation2Filter, setObservation2Filter] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar el modal de trabajadores
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // Estado para el modal de horarios
  const [isPlannedModalOpen, setIsPlannedModalOpen] = useState(false); // Estado para el modal de horarios
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [documentList, setDocumentList] = useState('');

  const { workers, loading, error, urlKustomer, emails, availableDates } = useWorkersWithFilters({
    search, nameList, nameList2, nameList3, statusFilter, teamFilter, selectedDate, timeFilter, exactStart, roleFilter, observation1Filter, observation2Filter, attendanceFilter, documentList
  });

  const handleAction = () => {
    const message = urlKustomer;
    navigator.clipboard
      .writeText(message)
      .catch(() => alert("Error al copiar el texto"));
  };

  const handleActionOffline = () => {
    const message = `${urlKustomer}&filter.agent.status=OFFLINE`;
    navigator.clipboard
      .writeText(message)
      .catch(() => alert("Error al copiar el texto"));
  };

  const handleActionEmails = () => {
    const message = `${emails}`;
    navigator.clipboard
      .writeText(message)
      .catch(() => alert("Error al copiar el texto"));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openScheduleModal = () => setIsScheduleModalOpen(true);
  const closeScheduleModal = () => setIsScheduleModalOpen(false);

  const openPlannedModal = () => setIsPlannedModalOpen(true);
  const closePlannedModal = () => setIsPlannedModalOpen(false);

  const openAttendanceModal = () => setIsAttendanceModalOpen(true);
  const closeAttendanceModal = () => setIsAttendanceModalOpen(false);

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  return (
    <div className="p-4 space-y-6 text-xs">
      <div className='sm:w-[60%] w-[80%] mx-auto grid grid-cols-4 gap-4'>
        <NameListFilter nameList={nameList} setNameList={setNameList} title='Search by agent list:' />
        <NameListFilter nameList={nameList2} setNameList={setNameList2} title='Missing by agent list:'/>
        <NameListFilter nameList={nameList3} setNameList={setNameList3} title='Found by agent list:'/>
        <DocumentListFilter documentList={documentList} setDocumentList={setDocumentList} />
        <div className=' col-span-2 col-start-2'>
          <SearchFilter  search={search}   setSearch={setSearch} />
        </div>
        
      </div>
      
      <TeamDayTimeFilter
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        teamFilter={teamFilter} setTeamFilter={setTeamFilter}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        timeFilter={timeFilter} setTimeFilter={setTimeFilter}
        exactStart={exactStart} setExactStart={setExactStart}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        observation1Filter={observation1Filter} setObservation1Filter={setObservation1Filter}
        observation2Filter={observation2Filter} setObservation2Filter={setObservation2Filter}
        attendanceFilter={attendanceFilter} setAttendanceFilter={setAttendanceFilter}
        availableDates={availableDates}
      />
      <div className='flex gap-4 items-center'>
        <div>Mostrando <strong>{workers.length}</strong> agentes</div>
        <button
          onClick={handleAction}
          className="px-3 py-1 text-white rounded"
        >
          All Users Link
        </button>
        <button
          onClick={handleActionOffline}
          className="px-3 py-1 text-white rounded"
        >
          All Users Link Offline
        </button>
        <button
          onClick={handleActionEmails}
          className="px-3 py-1 text-white rounded"
        >
          All Emails
        </button>
        <button
          onClick={openModal}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Subir Trabajadores
        </button>
        <button
          onClick={openScheduleModal}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Subir Horarios
        </button>
        <button
          onClick={openPlannedModal}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Subir Planificado
        </button>
        <button
          onClick={openAttendanceModal}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Subir Asistencia
        </button>
      </div>
      
      <WorkersTable workers={workers} selectedDate={selectedDate} />
      
      {/* Modal para subir trabajadores */}
      <UploadWorkersModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Modal para subir horarios */}
      <UploadSchedulesModal isOpen={isScheduleModalOpen} onClose={closeScheduleModal} />

      <UploadPlannedModal isOpen={isPlannedModalOpen} onClose={closePlannedModal} />

      <UploadAttendanceModal isOpen={isAttendanceModalOpen} onClose={closeAttendanceModal} />
    </div>
  );
}

