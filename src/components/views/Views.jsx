import ForecastsPage from "./ForecastVsReal/components/ForecastsPage"
import FcstVsRealTimePage from "./fcstVsRealMetabase/FcstVsRealTimePage"

export function Views() {
    return (
        <div className="mt-5">
            {/* <ForecastsPage /> */}
            <FcstVsRealTimePage />
        </div>
    )
}