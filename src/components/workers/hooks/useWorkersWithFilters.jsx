import { useState, useEffect, useMemo } from "react";
import { parseNames } from "../utils/parseUtils";
import { expandOvernight, inWindow, toMinutes } from "../utils/scheduleUtils";

function isSessionValid() {
  const token = localStorage.getItem("token"); // Cambié a localStorage
  return token && !isTokenExpired(token); // Sólo si el token de sesión está presente y no está expirado
}

function isTokenExpired(token) {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return exp * 1000 <= Date.now();
  } catch {
    return true; // Si hay un error al parsear el token, se considera expirado
  }
}

export function useWorkersWithFilters({
  search,
  nameList,
  statusFilter,
  teamFilter,
  selectedDate,
  timeFilter,
  exactStart,
  roleFilter,
  observation1Filter,
  observation2Filter,
  documentList,
}) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [urlKustomer, setUrlKustomer] = useState("");
  const [emails, setEmails] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token"); // Cambié a localStorage

    if (!isSessionValid()) {
      // Si la sesión ha expirado o no existe el token, limpiamos todo
      localStorage.removeItem("workers"); // Cambié a localStorage
      localStorage.removeItem("workers_timestamp"); // Cambié a localStorage
      setWorkers([]);
      setLoading(false);
      return;
    }

    // Si la sesión está activa, revisamos la caché de los trabajadores
    const cachedWorkers = localStorage.getItem("workers"); // Cambié a localStorage
    const cachedTimestamp = localStorage.getItem("workers_timestamp"); // Cambié a localStorage

    if (cachedWorkers && cachedTimestamp) {
      setWorkers(JSON.parse(cachedWorkers));
      setLoading(false);
    } else {
      // Si no está en caché, hacemos la petición al servidor
      fetch(`${import.meta.env.PUBLIC_URL_BACKEND}workers`, {
        headers: {
          // Pasamos el token de sesión en el header
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Error ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const activeWorkers = data;
          // .filter(
          //   (worker) => worker.status?.name === "Activo"
          // );
          localStorage.setItem("workers", JSON.stringify(activeWorkers)); // Cambié a localStorage
          localStorage.setItem("workers_timestamp", Date.now().toString()); // Cambié a localStorage

          setWorkers(activeWorkers);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, []); // Se vuelve a cargar si cambia el token de sesión

  // Se extra las fechas únicas de todos los schedules
  const availableDates = useMemo(() => {
    // 1) extrae y deduplica
    const allDates = workers.flatMap((w) => w.schedules.map((t) => t.date));
    const uniqDates = Array.from(new Set(allDates));

    // 2) ordena lexicográficamente — con ISO funciona igual que cronológico
    uniqDates.sort((a, b) => a.localeCompare(b));

    return uniqDates; // array de strings "2025-06-16", …
  }, [workers]);

  const filtered = useMemo(() => {
    const parsedDocuments = (documentList || "")
      .split(/\s+/) // Separar por espacios o saltos de línea
      .map((doc) => doc.trim())
      .filter((doc) => doc.length > 0); // Limpiar y eliminar valores vacíos

    let result = workers;

    // Filtrar por documentos si la lista de documentos no está vacía
    if (parsedDocuments.length) {
      result = result.filter((w) => {
        return parsedDocuments.includes(w.document?.toString());
      });
    }

    // Filtrar por nombre
    const parsedNames = parseNames(nameList);
    if (parsedNames.length) {
      result = result.filter((w) => {
        const email = w.kustomer_email?.toLowerCase() || "";
        const fullName = w.name?.toLowerCase() || "";

        return parsedNames.some((n) => {
          // dividir cada n en tokens (como en tu búsqueda normal)
          const nTokens = n.split(/\s+/).filter(Boolean);

          // Caso 1: coincide por email exacto
          if (email === n) return true;

          // Caso 2: todos los tokens de la línea de lista están en el nombre
          return nTokens.every((tok) => fullName.includes(tok));
        });
      });
    }

    const tokens = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (tokens.length) {
      result = result.filter((w) =>
        tokens.every((tok) => w.name.toLowerCase().includes(tok))
      );
    }

    // Quitar duplicados por documento
    result = Array.from(new Map(result.map((w) => [w.document, w])).values());

    if (teamFilter) {
      result = result.filter((w) => {
        const t = w.team?.name;
        const obs = (w.observation_1 || "").toString().toUpperCase();

        if (teamFilter === "CHAT CUSTOMER HC" || teamFilter === "CHAT RIDER HC" || teamFilter === "CALL VENDOR HC"){          
          return (t === teamFilter && !obs.includes('PORTUGAL'));
        } 
        if (teamFilter === "ALL HC"){
          const allHc = ["CUSTOMER TIER 1", "CUSTOMER TIER 2","RIDER TIER 1", "RIDER TIER 2","VENDOR TIER 1", "VENDOR TIER 2",]
          return allHc.includes(t);
        }
        return t === teamFilter
      });
    }

    // Después de todos los filtros de texto, equipo, rol y observaciones
    if (selectedDate || (timeFilter && timeFilter.length > 0)) {
      console.log(exactStart)
      // calculamos el rango continuo de minutos sólo una vez
      let rangeStart, rangeEnd;
      if (timeFilter && timeFilter.length > 0) {
        const mins = timeFilter.map(toMinutes).sort((a, b) => a - b);
        rangeStart = mins[0]; // minuto inicial del rango
        rangeEnd = mins[mins.length - 1] + 30; // minuto final (+30m)
      }

      result = result.filter((w) => {
        const turns =
          w.contract_type?.name === "UBYCALL"
            ? w.ubycall_schedules
            : w.schedules;
        const frags = expandOvernight(turns);
        return frags.some((frag) => {
          // 1) filtrado por fecha si está aplicado
          if (selectedDate && frag.date !== selectedDate) return false;

          // 2) filtrado por hora usando rango continuo
          if (timeFilter && timeFilter.length > 0) {
            const s = toMinutes(frag.start);
            const e = frag.end === "24:00" ? 1440 : toMinutes(frag.end);
            
            if (exactStart) {
              const slotStart = rangeStart;
              const slotEnd = rangeStart + 30;
              return s >= slotStart && s < slotEnd;
            } else {
              // 👈 modo actual: rango continuo
              return s < rangeEnd && e > rangeStart;
            }
          }

          // si sólo hay fecha, pasó ambos chequeos
          return true;
        });
      });
    }

      if (statusFilter) {
        result = result.filter((w) => {
          const status = (w.status?.name || "").toString().toUpperCase();
          const obs = (w.observation_1 || "").toString().toUpperCase();
          const schedule = w.schedules.map((item) => {
            // Compara las fechas y retorna 'obs' si coincide con 'selectedDate', o un string vacío
            if (item.date === selectedDate) {
              return item.obs || ""; // Retorna el valor de 'obs' o un string vacío si no tiene valor
            }
            return ""; // Si no coincide la fecha, retorna un string vacío
          });
          if (statusFilter === "ACTIVO" || statusFilter === "INACTIVO") {
            return status === statusFilter;
          } else if (statusFilter === "VACACIONES") {
            // Retorna verdadero solo si al menos un 'obs' no está vacío
            return schedule.some((obs) => obs !== "");
          }
          return true;
        });
      }

    if (roleFilter) {
      result = result.filter((w) => {
        const r = w.role?.name;
        return r.includes(roleFilter);
      });
    }

    if (observation1Filter) {
      console.log(observation1Filter)
      result = result.filter((w) => {
        const obs = (w.observation_1 || "").toString().toUpperCase();
        const contract_type = (w.contract_type?.name || "")
          .toString()
          .toUpperCase();
        if(observation1Filter === "CONCENTRIX"){
          return (contract_type.includes("PART TIME") || contract_type.includes("FULL TIME")) && !obs.includes('APOYO')
        }
        return contract_type.includes(observation1Filter) && !obs.includes('APOYO');
      });
    }

    if (observation2Filter) {
      result = result.filter((w) => {
        const obs2 = (w.observation_2 || "").toString().toUpperCase();
        const obs1 = (w.observation_1 || "").toString().toUpperCase();
        const team = (w.team?.name || "").toString().toUpperCase();

        if (observation2Filter === "APOYO") {
          return obs1.includes(observation2Filter);
        }
        if (observation2Filter === "CUSTOMER TIER 1" || observation2Filter === "RIDER TIER 1") {
          return team.includes(observation2Filter) && obs2.includes("BACK UP TIER 2");
        }
        return true
      });
    }

    return result;
  }, [
    workers,
    search,
    nameList,
    statusFilter,
    teamFilter,
    exactStart,
    selectedDate,
    timeFilter,
    roleFilter,
    observation1Filter,
    observation2Filter,
    documentList, // Agregamos documentList aquí
  ]);

  useEffect(() => {
    // Extraemos sólo los IDs y los unimos con coma
    const ids = filtered.map((w) => w.kustomer_id).filter(Boolean); // descartamos undefined/null si existen

    const url = `https://glovo-eu.deliveryherocare.com/supervisor/agent-monitor?filter.agent.ids=${ids.join(
      "%2C"
    )}`;

    const emails = filtered.map((w) => w.kustomer_email).filter(Boolean);

    const allEmails = `${emails.join('\n')}`

    setUrlKustomer(url);
    setEmails(allEmails)
  }, [filtered]);
  return { workers: filtered, loading, error, urlKustomer, emails, availableDates };
}
