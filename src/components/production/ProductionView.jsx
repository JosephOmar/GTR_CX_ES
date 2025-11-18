import CustomerProductionTable from "./CustomerProductionTable"
import VendorProductionTable from "./VendorProductionTable"
export function ProductionView() {
    console.log('xd') 
    return (
        <div className="mt-5">
            <VendorProductionTable />
            <CustomerProductionTable />
        </div>
    )
}