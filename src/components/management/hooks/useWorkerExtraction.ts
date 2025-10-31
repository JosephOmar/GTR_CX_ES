import { useWorkersWithFilters } from "../../workers/hooks/useWorkersWithFilters";
import { getTodayDay } from "../../workers/utils/scheduleUtils";
import type { Worker } from "../../workers/types/types";

export interface ExtractionResult {
  worker: Worker;
  contractLabel: string;
  diffSec: number;
  hmsStr: string;
}

export function useWorkerExtraction(nameInput: string, timeInput: string) {
  const { workers, loading, error } = useWorkersWithFilters({
    search: "",
    nameList: "",
    nameList2: "",
    nameList3: "",
    statusFilter: "",
    teamFilter: [],
    selectedDate: "",
    timeFilter: "",
    exactStart: "",
    roleFilter: "",
    observation1Filter: "",
    observation2Filter: "",
    attendanceFilter: "",
    documentList: "",
  });

  const extract = (): ExtractionResult | null => {
    const extractedName = nameInput.split("(")[0].split(":").pop()?.trim().toLowerCase();
    const worker = workers.find(
      (w : any) => w.kustomer_name?.toLowerCase() === extractedName ||
             w.api_email?.toLowerCase() === extractedName
    );
    if (!worker) {
      alert(`No encontré un worker llamado "${extractedName}"`);
      return null;
    }

    const ct = worker.contract_type.name;
    const contractLabel =
      ct === "FULL TIME" || ct === "PART TIME" ? "CONCENTRIX" : "UBYCALL";

    const now = new Date();
    let diffSec = 0;
    let hmsStr = "00:00:00";

    if (timeInput) {
      const m = timeInput.match(/(\d{1,2}:\d{2}(?::\d{2})?\s?(AM|PM))/i);
      const timePart = m ? m[1] : "";

      let [hms, meridiem] = timePart.split(" ");
      meridiem = meridiem?.toUpperCase();
      let [hh, mm, ss = 0] = hms.split(":").map(Number);
      if (meridiem === "PM" && hh < 12) hh += 12;
      if (meridiem === "AM" && hh === 12) hh = 0;
      const inputDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hh,
        mm,
        ss
      );
      diffSec = Math.max(0, Math.floor((now.getTime() - inputDate.getTime()) / 1000));
      const dh = Math.floor(diffSec / 3600);
      const dm = Math.floor((diffSec % 3600) / 60);
      const ds = diffSec % 60;
      hmsStr = [dh, dm, ds].map((v) => v.toString().padStart(2, "0")).join(":");
    }

    return { worker, contractLabel, diffSec, hmsStr };
  };

  return { extract, workers, loading, error };
}