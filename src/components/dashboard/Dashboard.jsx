import React from 'react'
import { usePlannedData } from '../management/hooks/usePlannedData'
import TableFcstVsReal from './components/fcst_vs_real/TableFcstVsReal'
import TableAttendance from './components/attendance/TableAttendance'

const Dashboard = () => {

  return (
    <div>
        {/* <div>
            <TableFcstVsReal />
        </div> */}
        <div>
            <TableAttendance />
        </div>
    </div>
  )
}

export default Dashboard