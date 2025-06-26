import React from 'react';
import { useForecasts } from '../hooks/useForecasts';

// IMPORTA siempre desde components/
import { FileUploader }       from '../components/FileUploader';
import { QueueFilter }        from '../components/QueueFilter';
import { TimeRangeSelector }  from '../components/TimeRangeSelector';
import { ForecastsTable }     from '../components/ForecastsTable';
import { CaptureButton }      from '../components/CaptureButton';

export default function ForecastsPage() {
  const {
    filtered, totals,
    loadFile,
    queueFilter, setQueueFilter,
    timeRange, handleTimeSelect, analysis
  } = useForecasts();
  return (
    <div className='w-full'>
        <h2 className="space-y-8 p-6 text-center text-[#00A082] text-4xl font-bold">View Assembled</h2>
        <div className="w-[70vw] mx-auto">
            <FileUploader onFileSelected={loadFile} />
            <QueueFilter  value={queueFilter} onChange={setQueueFilter} />
            <TimeRangeSelector selected={timeRange} onSelect={handleTimeSelect} />
            <ForecastsTable data={filtered} totals={totals} analysis={analysis} />
            <CaptureButton data={filtered}
          totals={totals}
          timeRange={timeRange}/>
        </div>
    </div>
  );
}
