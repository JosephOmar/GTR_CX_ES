import React, { useState } from 'react';
import { NameListFilter }    from './components/NameListFilter';
import { SearchFilter }      from './components/SearchFilter';
import { TeamDayTimeFilter } from './components/TeamDayTimeFilter';
import { WorkersTable }      from './components/WorkersTable';
import { useWorkersWithFilters } from './hooks/useWorkersWithFilters';
import { getTodayDay }       from './utils/scheduleUtils';
import { LoadingOrError } from './components/LoadingOrError';
import PrivateRoute from '../Auth/PrivateRoute';

export default function WorkersWithSchedules() {
  const [search,      setSearch]      = useState('');
  const [nameList,    setNameList]    = useState('');
  const [teamFilter,  setTeamFilter]  = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [timeFilter,  setTimeFilter]  = useState('');

  const { workers, loading, error } = useWorkersWithFilters({
    search, nameList, teamFilter, selectedDay, timeFilter
  });

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  return (
    <div className="p-4 space-y-6 text-xs">
      <NameListFilter nameList={nameList} setNameList={setNameList} />
      <SearchFilter  search={search}   setSearch={setSearch} />
      <TeamDayTimeFilter
        teamFilter={teamFilter} setTeamFilter={setTeamFilter}
        selectedDay={selectedDay} setSelectedDay={setSelectedDay}
        timeFilter={timeFilter} setTimeFilter={setTimeFilter}
      />
      <div>Mostrando <strong>{workers.length}</strong> agentes</div>
      <WorkersTable workers={workers} selectedDay={selectedDay} />
    </div>
  );
}
