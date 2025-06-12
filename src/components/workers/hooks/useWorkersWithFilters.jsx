import { useState, useEffect, useMemo } from "react";
import { parseNames } from "../utils/parseUtils";
import { expandOvernight, inWindow } from "../utils/scheduleUtils";

export function useWorkersWithFilters({
  search,
  nameList,
  teamFilter,
  selectedDay,
  timeFilter,
}) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://gtr-glovoes-cxpe.onrender.com/workers")
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) =>
        setWorkers(data.filter((w) => w.status?.name === "Activo"))
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    // parse textarea
    const parsed = parseNames(nameList);

    // 1) filtro por kustomer_name
    let f = parsed.length
      ? workers.filter((w) => {
          const kn = w.kustomer_name ?? "";
          return parsed.includes(kn.toLowerCase());
        })
      : workers;

    // 2) búsqueda libre por w.name
    const tokens = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (tokens.length) {
      f = f.filter((w) =>
        tokens.every((tok) => w.name.toLowerCase().includes(tok))
      );
    }

    // 3) dedupe por documento
    f = Array.from(new Map(f.map((w) => [w.document, w])).values());

    // 4) por team
    if (teamFilter) {
      f = f.filter((w) => {
        const t = w.team?.name;

        if (teamFilter === "MAIL_CUSTOMER_GROUP") {
          // agrupa MAIL CUSTOMER y MAIL CUSTOMER IS
          return ["MAIL CUSTOMER", "MAIL CUSTOMER IS"].includes(t);
        }

        if (teamFilter === "VENDORS_GROUP") {
          // agrupa CALL VENDORS y MAIL VENDORS
          return ["CALL VENDORS", "MAIL VENDORS"].includes(t);
        }

        // caso normal: coincide exactamente
        return t === teamFilter;
      });
    }

    // 5) por día/hora
    if (timeFilter) {
      f = f.filter((w) => {
        const turns =
          w.contract_type?.name === "UBYCALL"
            ? w.ubycall_schedules
            : w.schedules;
        return expandOvernight(turns).some((frag) =>
          inWindow(frag, selectedDay, timeFilter)
        );
      });
    }

    return f;
  }, [workers, search, nameList, teamFilter, selectedDay, timeFilter]);

  return { workers: filtered, loading, error };
}
