import { useState, useEffect, useMemo } from "react";
import { parseNames } from "../utils/parseUtils";
import { expandOvernight, inWindow } from "../utils/scheduleUtils";

function isTokenValid(token) {
  if (!token) return false;
  try {
    // el payload es la parte central del JWT
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    // exp viene en segundos
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

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

    if (typeof window === "undefined") return;
    // si no hay token o ya expiró, invalidamos el cache

    const token = localStorage.getItem("token");
    
    if (!isTokenValid(token)) {
      localStorage.removeItem("workers");
      localStorage.removeItem("workers_timestamp");
      setWorkers([]);
      setLoading(false);
      return;
    }

    const cachedWorkers = localStorage.getItem("workers");
    const cachedTimestamp = localStorage.getItem("workers_timestamp");
    const currentTimestamp = Date.now();

    // si hay cache y no ha pasado 12 horas, lo usamos
    if (
      cachedWorkers &&
      cachedTimestamp &&
      currentTimestamp - Number(cachedTimestamp) < 12 * 60 * 60 * 1000
    ) {
      setWorkers(JSON.parse(cachedWorkers));
      setLoading(false);
      console.log('jeje sigo en cache')
    } else {
      // si no, pedimos datos al servidor
      fetch("https://gtr-glovoes-cxpe.onrender.com/workers", {
        headers: {
          // pasamos el token en el header (si tu API lo requiere)
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Error ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const activeWorkers = data.filter(
            (worker) => worker.status?.name === "Activo"
          );

          localStorage.setItem(
            "workers",
            JSON.stringify(activeWorkers)
          );
          localStorage.setItem(
            "workers_timestamp",
            Date.now().toString()
          );

          setWorkers(activeWorkers);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, []); // recarga efecto si cambia el token

  const filtered = useMemo(() => {
    const parsed = parseNames(nameList);
    let result = parsed.length
      ? workers.filter((w) =>{
          parsed.includes((w.kustomer_name ?? "").toLowerCase())
        }
        )
      : workers;

    const tokens = search
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length) {
      result = result.filter((w) =>
        tokens.every((tok) => w.name.toLowerCase().includes(tok))
      );
    }

    // quitar duplicados por documento
    result = Array.from(
      new Map(result.map((w) => [w.document, w])).values()
    );

    if (teamFilter) {
      result = result.filter((w) => {
        const t = w.team?.name;
        if (teamFilter === "MAIL_CUSTOMER_GROUP") {
          return ["MAIL CUSTOMER", "MAIL CUSTOMER IS"].includes(t);
        }
        if (teamFilter === "VENDORS_GROUP") {
          return ["CALL VENDORS", "MAIL VENDORS"].includes(t);
        }
        return t === teamFilter;
      });
    }

    if (timeFilter) {
      result = result.filter((w) => {
        const turns =
          w.contract_type?.name === "UBYCALL"
            ? w.ubycall_schedules
            : w.schedules;
        return expandOvernight(turns).some((frag) =>
          inWindow(frag, selectedDay, timeFilter)
        );
      });
    }

    return result;
  }, [workers, search, nameList, teamFilter, selectedDay, timeFilter]);

  return { workers: filtered, loading, error };
}
