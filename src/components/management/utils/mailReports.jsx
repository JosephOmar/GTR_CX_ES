import { toUnicodeBold } from "./toUnicodeBold";
import { getRoundedDisplayTime } from "../hooks/timeUtils";

export const toNum = (str) => Number(str) || 0;

export function buildCustomerReport(data) {
  const t = getRoundedDisplayTime();
  const {
    loEsAdCustomer,
    severeIncidences,
    partialRefunds,
    reclamosES,
    vencidosCustomer,
    porVencerCustomer,
    porVencerHoursCustomer,
  } = data;
  const los = toNum(loEsAdCustomer);
  const sev = toNum(severeIncidences);
  const par = toNum(partialRefunds);
  const rec = toNum(reclamosES);
  const ven = toNum(vencidosCustomer);
  const por = toNum(porVencerCustomer);
  const ph = toNum(porVencerHoursCustomer);

  const utime = ph <= 12 ? "hrs" : "min";

  return (
    `📬 ${toUnicodeBold(
      "Reporte Bandeja Customer"
    )} (actualizado a las ${t} hrs)\n\n` +
    `🚫 LO ES/AD Customer: ${los}\n` +
    `⚠️ Severe Incidences: ${sev}\n` +
    `🔄 Partial Refunds: ${par}\n` +
    `✅ Reclamos ES: ${rec}\n\n` +
    `🚨 Correos perdidos: ${ven}\n` +
    `⏳ Por vencer (>= ${ph} ${utime}): ${por}`
  );
}

export function buildRiderReport(data) {
  const t = getRoundedDisplayTime();
  const {
    loEsAdRider,
    vencidosRider,
    porVencerRider,
    porVencerHoursRider,
    agentsRider,
  } = data;
  const los = toNum(loEsAdRider);
  const ven = toNum(vencidosRider);
  const por = toNum(porVencerRider);
  const ph = toNum(porVencerHoursRider);
  const ag = toNum(agentsRider);

  const utime = ph <= 12 ? "hrs" : "min";
  return (
    `🏍️ ${toUnicodeBold("Reporte Bandeja Rider")} (hasta las ${t} hrs)\n\n` +
    `🚫 LO ES/AD Glover Emails: ${los}\n` +
    `🚨 Correos perdidos: ${ven}\n\n` +
    `⏳ Por vencer (>= ${ph} ${utime}): ${por}\n` +
    `👥 Agentes activos en canal: ${ag}`
  );
}

export function buildVendorsReport(data) {
  const t = getRoundedDisplayTime();
  const {
    notAssigned,
    assigned,
    loLevel2,
    tier2Partner,
    mcDonaldsSpain,
    vencidosVendors,
    porVencerVendors,
    porVencerHoursVendors,
  } = data;
  const na = toNum(notAssigned);
  const asn = toNum(assigned);
  const ll2 = toNum(loLevel2);
  const t2 = toNum(tier2Partner);
  const mc = toNum(mcDonaldsSpain);
  const ven = toNum(vencidosVendors);
  const por = toNum(porVencerVendors);
  const ph = toNum(porVencerHoursVendors);

  const utime = ph <= 12 ? "hrs" : "min";

  return (
    `🛒 ${toUnicodeBold("Reporte Bandeja Vendor")} (hasta las ${t} hrs)\n\n` +
    `🚫 LO ES/AD Partner Emails Not Assigned: ${na}\n` +
    `✅ LO ES/AD Partner Emails Assigned (Vendors + AM): ${asn}\n` +
    `⚠️ LO Level2 Partner Spain Emails: ${ll2}\n` +
    `✅ Tier2 Partner Emails: ${t2}\n` +
    `🔴 PX & Support McDonald’s Spain: ${mc}\n\n` +
    `🚨 Correos perdidos: ${ven}\n` +
    `⏳ Por vencer (>= ${ph} ${utime}): ${por}`
  );
}
