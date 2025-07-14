import { toUnicodeBold } from "./toUnicodeBold";

export const toNum = (str) => Number(str) || 0;

export function buildChatCustomerReport({
  agentes,
  bandejaActual,
  snapcall,
  agentesNesting,
  nestingFull,
  nestingPart,
  cola,
}) {
  const ccA = toNum(agentes);
  const ccB = toNum(bandejaActual);
  const ccS = toNum(snapcall);
  const ccAN = toNum(agentesNesting);
  const ccNF = toNum(nestingFull);
  const ccNP = toNum(nestingPart);
  const ccQ = toNum(cola);

  const regular = Math.max(0, ccA - ccAN);
  const nestChats = ccNF * 2 + ccNP;
  const main = Math.max(0, ccB - nestChats);
  const chats = Math.max(0, main - ccS);
  const totalCap = regular * 4 + ccAN * 2;
  const consumed = chats + ccS * 3;
  const rest = totalCap - consumed;
  const con4 = regular ? (consumed / regular).toFixed(1) : "0.0";
  const con2 = ccAN ? (nestChats / ccAN).toFixed(1) : "0.0";

  const emoji = con4 < 2 ? "🟢" : con4 < 3 ? "🟠" : "🔴";
  const emojiQ = "🚨🚨";

  const title = toUnicodeBold("Reporte de Capacidad - Chat Customer");
  if (ccQ > 0) {
    return (
      `🔹 ${title} 💬📈\n\n` +
      `🧑‍💻 Agentes en total: ${regular}\n` +
      `📊 Capacidad total: ${totalCap} chats\n` +
      `⚠️ Chats en cola: ${ccQ} ${emojiQ}\n`
    );
  } else if (ccAN === 0) {
    return (
      `🔹 ${title} 💬📈\n\n` +
      `${toUnicodeBold("Agentes con Capacidad 4 (Cap4)")}\n` +
      `🧑‍💻 ${regular} agente(s) disponibles\n` +
      `💬 ${chats} chat(s) activos\n` +
      `📞 ${ccS} Snapcall(s) en curso\n\n` +
      `⭐ ${toUnicodeBold("Capacidad Total:")} ${totalCap} contacto(s)\n` +
      `🧮 ${toUnicodeBold(
        "Capacidad Restante:"
      )} ${rest} contacto(s) disponibles\n\n` +
      `📊 ${toUnicodeBold("Concurrencia Actual")}\n` +
      `🔹 Cap4: ${con4} contacto(s)/agente ${emoji}\n`
    );
  } else {
    return (
      `🔹 ${title} 💬📈\n\n` +
      `${toUnicodeBold("Agentes con Capacidad 4 (Cap4)")}\n` +
      `🧑‍💻 ${regular} agente(s) disponibles\n` +
      `💬 ${chats} chat(s) activos\n` +
      `📞 ${ccS} Snapcall(s) en curso\n\n` +
      `${toUnicodeBold("Agentes con Capacidad 2 (Cap2)")}\n` +
      `🧑‍💻 ${ccAN} agente(s) disponibles\n` +
      `💬 ${nestChats} chat(s) activos\n\n` +
      `⭐ ${toUnicodeBold("Capacidad Total:")} ${totalCap} contacto(s)\n` +
      `🧮 ${toUnicodeBold(
        "Capacidad Restante:"
      )} ${rest} contacto(s) disponibles\n\n` +
      `📊 ${toUnicodeBold("Concurrencia Actual")}\n` +
      `🔹 Cap4: ${con4} contacto(s)/agente ${emoji}\n` +
      `🔸 Cap2: ${con2} contacto(s)/agente`
    );
  }
}

export function buildChatRiderReport({
  agentes,
  bandejaActual,
  agentesNesting,
  bandejaNesting,
  cola,
}) {
  const crA = toNum(agentes);
  const crB = toNum(bandejaActual);
  const crAN = toNum(agentesNesting);
  const crBN = toNum(bandejaNesting);
  const crQ = toNum(cola);

  const regular = Math.max(0, crA - crAN);
  const nest = crBN;
  const main = Math.max(0, crB - nest);
  const totalCap = regular * 3 + crAN;
  const rest = totalCap - crB;
  const con3 = regular ? (main / regular).toFixed(1) : "0.0";
  const con1 = crAN ? (nest / crAN).toFixed(1) : "0.0";

  const emoji = con3 < 2 ? "🟢" : con3 < 2.5 ? "🟠" : "🔴";
  const emojiQ = "🚨🚨";

  const title = toUnicodeBold("Reporte de Capacidad - Chat Rider");
  if (crQ > 0) {
    return (
      `🔹 ${title} 🛵📈\n\n` +
      `🧑‍💻 Agentes totales: ${regular}\n` +
      `📊 Capacidad total: ${totalCap} chats\n` +
      `⚠️ Chats en cola: ${crQ}\n` +
      `🕑 Contactos esperando: ${crQ} ${emojiQ}`
    );
  } else if (crAN === 0) {
    return (
      `🔹 ${title} 🛵📈\n\n` +
      `${toUnicodeBold("Agentes con Capacidad 3 (Cap3)")}\n` +
      `🧑‍💻 ${regular} agente(s)\n` +
      `📌 ${main} chat(s) en gestión\n\n` +
      `⭐ Capacidad total: ${totalCap} chats\n` +
      `🧮 Capacidad restante: ${rest} chats\n\n` +
      `📊 Concurrencia Cap3: ${con3} chat(s)/agente ${emoji}`
    );
  } else
    return (
      `🔹 ${title} 🛵📈\n\n` +
      `👨‍💻 ${toUnicodeBold("Agentes con Capacidad 3 (Cap3)")}\n` +
      `🧑‍💻 ${regular} agente(s)\n` +
      `📌 ${main} chat(s) en gestión\n\n` +
      `🧑‍💼 ${toUnicodeBold("Agentes con Capacidad 1 (Cap1)")}\n` +
      `🧑‍💻 ${crAN} agente(s)\n` +
      `📌 ${nest} chat(s) en gestión\n\n` +
      `⭐ Capacidad total: ${totalCap} chats\n` +
      `🧮 Capacidad restante: ${rest} chats\n\n` +
      `📊 Concurrencia Cap3: ${con3} chat(s)/agente ${emoji}\n` +
      `📊 Concurrencia Cap1: ${con1} chat(s)/agente`
    );
}

export function buildCallVendorsReport({
  agentes,
  disponibles,
  enAuxiliar,
  cola,
}) {
  const cvL = toNum(agentes);
  const cvD = toNum(disponibles);
  const cvX = toNum(enAuxiliar);
  const cvQ = toNum(cola);
  return (
    `📞 ${toUnicodeBold("Panel Actual - AGILICEMOS")}  ♻️ ${toUnicodeBold(
      "MANTENGAMOS EL CONTROL"
    )}\n\n` +
    `🔵 Llamadas en curso: ${cvL}\n` +
    `🟢 Asesores disponibles: ${cvD}\n` +
    `🟡 Asesores en auxiliar: ${cvX}\n` +
    `🆘 Llamadas en cola: ${cvQ}`
  );
}
