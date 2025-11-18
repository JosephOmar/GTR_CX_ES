import ForecastsPage from "./ForecastVsReal/components/ForecastsPage"
import FcstVsRealTimePage from "./fcstVsRealMetabase/FcstVsRealTimePage"
import CustomerProductionTable from "./productionTier2/CustomerProductionTable"
import VendorProductionTable from "./productionTier2/VendorProductionTable"
export function Views() {
    return (
        <div className="mt-5">
            {/* <ForecastsPage /> */}
            <FcstVsRealTimePage />
            <VendorProductionTable />
            <CustomerProductionTable />
        </div>
    )
}