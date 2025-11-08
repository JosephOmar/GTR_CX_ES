import { useState, useEffect, useMemo } from "react";
import { parseNames } from "../utils/parseUtils";
import { expandOvernight, inWindow, toMinutes } from "../utils/scheduleUtils";
import { getStringDays } from "../utils/scheduleUtils";
import { useWorkersStore } from "../store/WorkersStore";


function isTokenExpired(token) {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return exp * 1000 <= Date.now();
  } catch {
    return true; // Si hay un error al parsear el token, se considera expirado
  }
}

function normalizeString(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina tildes
    .replace(/ñ/g, "n")
    .trim();
}

function normalizeInput(str) {
  if (/\S+@\S+\.\S+/.test(str)) {
    return str.toLowerCase(); // email → no se normaliza
  }
  return normalizeString(str); // nombre → sí se normaliza
}

function normalizeNameForComparison(name = "") {
  const clean = normalizeString(name);
  const parts = clean.split(/\s+/).filter(Boolean).sort(); // ordenar alfabéticamente
  return parts.join(" ");
}
// compara de forma ligera: igual, 1 sustitución, 1 inserción/eliminación o 1 transposición adyacente
function isSimilarLight(a, b, tolerance = 1) {
  if (!a || !b) return false;
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (a === b) return true;

  const la = a.length,
    lb = b.length;
  if (Math.abs(la - lb) > tolerance) return false;

  // caso: mismas longitudes -> chequeo por sustituciones + transposición adyacente
  if (la === lb) {
    const diffs = [];
    for (let i = 0; i < la; i++) {
      if (a[i] !== b[i]) diffs.push(i);
      if (diffs.length > tolerance + 1) return false; // corte temprano
    }
    if (diffs.length <= tolerance) return true;

    // permitir 1 transposición adyacente (p. ej. "escriba" <-> "escirba")
    if (diffs.length === 2) {
      const i = diffs[0],
        j = diffs[1];
      if (j === i + 1 && a[i] === b[j] && a[j] === b[i]) return true;
    }
    return false;
  }

  // caso: longitudes diferentes (por 1) -> comprobar inserción/eliminación simple
  const [shorter, longer] = la < lb ? [a, b] : [b, a];
  let i = 0,
    j = 0,
    diffs = 0;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
    } else {
      diffs++;
      if (diffs > tolerance) return false;
      j++; // salta 1 en la cadena más larga
    }
  }
  diffs += longer.length - j; // resto de la cola
  return diffs <= tolerance;
}

export function useWorkersWithFilters({
  search,
  nameList,
  nameList2,
  nameList3,
  statusFilter,
  teamFilter,
  selectedDate,
  timeFilter,
  exactStart,
  roleFilter,
  observation1Filter,
  observation2Filter,
  attendanceFilter,
  documentList,
}) {
  const { workers, loading, error, fetchWorkers } = useWorkersStore();
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [urlKustomer, setUrlKustomer] = useState("");
  const [emails, setEmails] = useState("");
  const [excelText, setExcelText] = useState("");

  useEffect(() => {
    if (workers.length === 0) {
      fetchWorkers(); // ya maneja cache y sesión internamente
    }
  }, [workers.length, fetchWorkers]);

  const { todayStr, yesterdayStr } = getStringDays();
  // Se extra las fechas únicas de todos los schedules
  const availableDates = useMemo(() => {
    // 1) extrae y deduplica
    const allDates = workers.flatMap((w) =>
      w.schedules
        .map((t) => t.date)
        .filter((date) => date === todayStr || date === yesterdayStr)
    );
    const uniqDates = Array.from(new Set(allDates));

    // 2) ordena lexicográficamente — con ISO funciona igual que cronológico
    uniqDates.sort((a, b) => a.localeCompare(b));

    return uniqDates; // array de strings "2025-06-16", …
  }, [workers, todayStr, yesterdayStr]);

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
        const email = (w.api_email || "").toLowerCase(); // email intacto
        const fullName = normalizeString(w.name || ""); // nombre normalizado

        return parsedNames.some((n) => {
          const nNorm = normalizeInput(n);

          // Caso 1: email exacto
          if (email && email === nNorm) return true;

          // Caso 2: nombre completo similar
          if (isSimilarLight(fullName, nNorm, 2)) return true;

          // Caso 3: buscar token por token (Carmen Martinez → encuentra Carmen Celestino Martinez)
          const tokens = nNorm.split(/\s+/);
          return tokens.every((t) => fullName.includes(t));
        });
      });
    }

    // --- NUEVO FILTRO: mostrar los que están en nameList2 pero no en nameList ---
    const parsedNames2 = parseNames(nameList2);

    if (parsedNames2.length) {
      const normalized1 = parsedNames.map((n) => normalizeNameForComparison(n));
      const normalized2 = parsedNames2.map((n) =>
        normalizeNameForComparison(n)
      );

      // Filtrar los que están en la segunda lista pero no en la primera
      const missingNames = normalized2.filter(
        (n2) => !normalized1.some((n1) => isSimilarLight(n1, n2, 2))
      );

      // Aplicar el filtro a los workers
      result = workers.filter((w) => {
        const email = (w.api_email || "").toLowerCase();
        const fullNameNorm = normalizeNameForComparison(w.name || "");

        return missingNames.some((n) => {
          const nNorm = normalizeNameForComparison(n);
          if (email && email === nNorm) return true;
          if (isSimilarLight(fullNameNorm, nNorm, 2)) return true;
          const tokens = nNorm.split(/\s+/);
          return tokens.every((t) => fullNameNorm.includes(t));
        });
      });
    }

    const parsedNames3 = parseNames(nameList3);

    if (parsedNames3.length) {
      const normalized1 = parsedNames.map((n) => normalizeNameForComparison(n));
      const normalized3 = parsedNames3.map((n) =>
        normalizeNameForComparison(n)
      );

      // Filtrar los que están en la tercera lista y si están en la primera
      const foundNames = normalized3.filter(
        (n3) => normalized1.some((n1) => isSimilarLight(n1, n3, 3))
      );

      // Aplicar el filtro a los workers
      result = workers.filter((w) => {
        const email = (w.api_email || "").toLowerCase();
        const fullNameNorm = normalizeNameForComparison(w.name || "");

        return foundNames.some((n) => {
          const nNorm = normalizeNameForComparison(n);
          if (email && email === nNorm) return true;
          if (isSimilarLight(fullNameNorm, nNorm, 3)) return true;
          const tokens = nNorm.split(/\s+/);
          return tokens.every((t) => fullNameNorm.includes(t));
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

    const teamSelected = Array.isArray(teamFilter)
      ? teamFilter
      : (teamFilter ? [teamFilter] : []);

    const hcTeams = [
      "CUSTOMER TIER1",
      "CUSTOMER TIER2",
      "RIDER TIER1",
      "RIDER TIER2",
      "VENDOR TIER1",
      "VENDOR TIER2",
      "VENDOR CALL",
      "VENDOR MAIL"
    ];

    if (teamSelected.length > 0) {

      if (teamSelected.includes("All HC")) {
        teamSelected.push(...hcTeams); // Añadimos los 8 equipos de HC a las selecciones
        teamSelected.splice(teamSelected.indexOf("All HC"), 1); // Eliminamos "All HC" de la selección
      }
      // Expande selecciones a un set de equipos permitidos
      const allowedTeams = new Set();
      for (const sel of teamSelected) {
          allowedTeams.add(sel);
      }

      result = result.filter((w) => {
        const t = w.team?.name;

        if (!allowedTeams.has(t)) return false;

        return true;
      });
    }

    // Después de todos los filtros de texto, equipo, rol y observaciones
      if (selectedDate || (timeFilter && timeFilter.length > 0)) {
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
                const slotEnd = rangeEnd;
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
            return item.obs || "";
          }
          return "";
        });

        if (statusFilter === "ACTIVO") {
          // Incluye solo si el status es ACTIVO
          // y si no tiene ninguna obs en schedule (VACACIONES)
          const hasVacation = schedule.some((obs) => obs !== "");
          return status === "ACTIVO" && !hasVacation;
        } else if (statusFilter === "INACTIVO") {
          return status === "INACTIVO";
        } else if (statusFilter === "VACACIONES") {
          // Retorna verdadero si al menos una obs no está vacía
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

    if (attendanceFilter) {
      result = result.filter((w) => {
        // buscar asistencia en la fecha seleccionada
        const attendance = w.attendances?.find((a) => a.date === selectedDate);

        // Si no existe registro, considerarlo Absent
        const status = attendance?.status?.toLowerCase() || "absent";

        if (attendanceFilter.toLowerCase() === "present") {
          // incluir tanto "present" como "late"
          return status === "present" || status === "late";
        }

        if (attendanceFilter.toLowerCase() === "absent") {
          return status === "absent";
        }

        // fallback: match exacto
        return status === attendanceFilter.toLowerCase();
      });
    }

    if (observation1Filter) {
      result = result.filter((w) => {
        const obs = (w.observation_1 || "").toString().toUpperCase();
        const obs2 = (w.observation_2 || "").toString().toUpperCase();
        const contract_type = (w.contract_type?.name || "")
          .toString()
          .toUpperCase();
        if (observation1Filter === "CONCENTRIX") {
          return (
            (contract_type.includes("PART TIME") ||
              contract_type.includes("FULL TIME")) &&
            !obs.includes("APOYO") && !obs2.includes("AUDITORIA DSAT")
          );
        }
        return (
          contract_type.includes(observation1Filter) && !obs.includes("APOYO") && !obs2.includes("AUDITORIA DSAT")
        );
      });
    }

    // if (observation2Filter) {
    //   result = result.filter((w) => {
    //     const obs2 = (w.observation_2 || "").toString().toUpperCase();
    //     const obs1 = (w.observation_1 || "").toString().toUpperCase();
    //     const team = (w.team?.name || "").toString().toUpperCase();

    //     if (observation2Filter === "APOYO") {
    //       return obs1.includes(observation2Filter);
    //     }
    //     if (
    //       observation2Filter === "CUSTOMER TIER1" ||
    //       observation2Filter === "RIDER TIER1"
    //     ) {
    //       return (
    //         team.includes(observation2Filter) && obs2.includes("BACK UP TIER2")
    //       );
    //     }
    //     return true;
    //   });
    // }

    if (observation2Filter) {
      result = result.filter((w) => {
        const productive = (w.productive || "").toString().toUpperCase();

        if (observation2Filter === "productive") {
          return productive.includes('SI');
        } else if(observation2Filter === "unproductive") {
          return !productive.includes('SI');
        }
        return true;
      });
    }

    return result;
  }, [
    workers,
    search,
    nameList,
    nameList2,
    nameList3,
    statusFilter,
    teamFilter,
    exactStart,
    selectedDate,
    timeFilter,
    roleFilter,
    observation1Filter,
    observation2Filter,
    attendanceFilter,
    documentList, // Agregamos documentList aquí
  ]);

  useEffect(() => {
    // Extraemos sólo los IDs y los unimos con coma
    const ids = filtered.map((w) => w.api_id).filter(Boolean); // descartamos undefined/null si existen

    const url = `https://glovo-eu.deliveryherocare.com/supervisor/agent-monitor?filter.agent.ids=${ids.join(
      "%2C"
    )}`;

    const emails = filtered.map((w) => w.api_email).filter(Boolean);
    const allEmails = emails.join("\n");

    // 👇 Construimos las filas para Excel: document, name, attendance(en selectedDate)
    const rows = filtered.map((w) => {
      const doc = w.document ?? "";
      const name = w.name ?? "";

      // buscamos la asistencia del día seleccionado
      const attendanceForDay = w.attendances?.find(
        (a) => a.date === selectedDate
      );

      const attendanceStatus = attendanceForDay?.status ?? "Absent";

      // columnas separadas por TAB (Excel lo lee perfecto)
      return `${doc}\t${name}\t${attendanceStatus}`;
    });

    const textForExcel = rows.join("\n");

    setUrlKustomer(url);
    setEmails(allEmails);
    setExcelText(textForExcel); // 👈 guardamos el texto listo para copiar
  }, [filtered, selectedDate]);
  return {
    workers: filtered,
    loading,
    error,
    urlKustomer,
    emails,
    availableDates,
    excelText
  };
}
