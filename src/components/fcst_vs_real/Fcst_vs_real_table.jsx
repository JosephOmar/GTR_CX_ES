import React from 'react'
import { usePlannedData } from '../management/hooks/usePlannedData'
import TableFcstVsReal from './components/TableFcstVsReal'

const Fcst_vs_real_table = () => {

  return (
    <div>
        <TableFcstVsReal />
    </div>
  )
}

export default Fcst_vs_real_table