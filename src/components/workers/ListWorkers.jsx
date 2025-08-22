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

export default function WorkersWithSchedules() {
  const [search, setSearch] = useState('');
  const [nameList, setNameList] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [timeFilter, setTimeFilter] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [observation1Filter, setObservation1Filter] = useState('');
  const [observation2Filter, setObservation2Filter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar el modal de trabajadores
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // Estado para el modal de horarios
  const [documentList, setDocumentList] = useState('');

  const { workers, loading, error, urlKustomer, availableDates } = useWorkersWithFilters({
    search, nameList, statusFilter, teamFilter, selectedDate, timeFilter, roleFilter, observation1Filter, observation2Filter, documentList
  });

  const handleAction = () => {
    const message = urlKustomer;
    navigator.clipboard
      .writeText(message)
      .catch(() => alert("Error al copiar el texto"));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openScheduleModal = () => setIsScheduleModalOpen(true);
  const closeScheduleModal = () => setIsScheduleModalOpen(false);

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  return (
    <div className="p-4 space-y-6 text-xs">
      <div className='sm:w-[50%] w-[80%] mx-auto grid grid-cols-2 gap-4'>
        <NameListFilter nameList={nameList} setNameList={setNameList} />
        <DocumentListFilter documentList={documentList} setDocumentList={setDocumentList} />
        <div className=' col-span-2'>
          <SearchFilter  search={search}   setSearch={setSearch} />
        </div>
        
      </div>
      
      <TeamDayTimeFilter
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        teamFilter={teamFilter} setTeamFilter={setTeamFilter}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        timeFilter={timeFilter} setTimeFilter={setTimeFilter}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        observation1Filter={observation1Filter} setObservation1Filter={setObservation1Filter}
        observation2Filter={observation2Filter} setObservation2Filter={setObservation2Filter}
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
      </div>
      
      <WorkersTable workers={workers} selectedDate={selectedDate} />
      
      {/* Modal para subir trabajadores */}
      <UploadWorkersModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Modal para subir horarios */}
      <UploadSchedulesModal isOpen={isScheduleModalOpen} onClose={closeScheduleModal} />
    </div>
  );
}

