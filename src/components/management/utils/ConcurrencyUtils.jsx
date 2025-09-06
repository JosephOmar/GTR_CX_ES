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

  const title = toUnicodeBold("Update Capacidad Customer");

  const textCap4 = `${toUnicodeBold("Agentes con Capacidad 4 (Cap4)")}\n` +
      `  ${regular} agentes disponibles\n` +
      `  ${chats} chats activos\n` +
      `  ${ccS} Snapcalls en curso\n\n`

  const textTotalCap = `${toUnicodeBold("Capacidad Total:")} ${totalCap} chats\n` +
      `${toUnicodeBold("Capacidad Restante:")} ${rest} chats disponibles\n\n`

  if (ccQ > 0) {
    return (
      `🔹 ${title}\n\n` +
      `Agentes en total: ${regular}\n` +
      `Capacidad total: ${totalCap} chats\n` +
      `Chats en cola: ${ccQ} ${emojiQ}\n`
    );
  } else if (ccAN === 0) {
    return (
      `🔹 ${title}\n\n` +
      `${textCap4}` +
      `${textTotalCap}` +
      `${toUnicodeBold("Concurrencia Actual")}\n` +
      `  Cap4: ${con4} chats/agente ${emoji}\n`
    );
  } else {
    return (
      `${title}\n\n` +
      `${textCap4}` +
      `${toUnicodeBold("Agentes con Capacidad 2 (Cap2)")}\n` +
      `  ${ccAN} agentes disponibles\n` +
      `  ${nestChats} chats activos\n\n` +
      `${textTotalCap}` +
      `${toUnicodeBold("Concurrencia Actual")}\n` +
      `  Cap4: ${con4} chats/agente ${emoji}\n` +
      `  Cap2: ${con2} chats/agente`
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

  const textCap3 = `${toUnicodeBold("Agentes con Capacidad 3 (Cap3)")}\n` +
      `  ${regular} agentes\n` +
      `  ${main} chats en gestión\n\n`
  
  const textTotalCap = `${toUnicodeBold(`Capacidad total:`)} ${totalCap} chats\n` +
      `${toUnicodeBold(`Capacidad restante:`)} ${rest} chats\n\n`

  const title = toUnicodeBold("Update Capacidad Rider");
  if (crQ > 0) {
    return (
      `🔹 ${title}\n\n` +
      `Agentes totales: ${regular}\n` +
      `Capacidad total: ${totalCap} chats\n` +
      `Chats en cola: ${crQ} ${emojiQ}`
    );
  } else if (crAN === 0) {
    return (
      `🔹 ${title}\n\n` +
      `${textCap3}` +
      `${textTotalCap}` +
      `${toUnicodeBold("Concurrencia Actual")}\n` +
      `  Cap3: ${con3} chats/agente ${emoji}`
    );
  } else
    return (
      `🔹 ${title}\n\n` +
      `${textCap3}` +
      `${toUnicodeBold("Agentes con Capacidad 1 (Cap1)")}\n` +
      `  ${crAN} agentes\n` +
      `  ${nest} chats en gestión\n\n`+
      `${textTotalCap}`+
      `${toUnicodeBold("Concurrencia Actual")}\n` +
      `  Cap3 ${con3} chats/agente ${emoji}\n` +
      `  Cap1 ${con1} chats/agente`
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

  const textQueue = (cvQ > 0) ? `${toUnicodeBold(`\n\nAgilicemos, tenemos contactos en espera`)}` : (cvD === 0) ? `${toUnicodeBold(`\n\nAgilicemos, no hay agentes disponibles`)}` : ''
  const emoji = (cvD > 0) ? '🟢' : (cvQ > 0) ? '🔴' : '🟠'

  return (
    `${toUnicodeBold(`Panel Actual Vendor ${emoji}`)}\n\n` +
    `  🔵 Llamadas en curso: ${cvL}\n` +
    `  🟢 Asesores disponibles: ${cvD}\n` +
    `  🟡 Asesores en auxiliar: ${cvX}\n` +
    `  🆘 Llamadas en cola: ${cvQ}` +
    `${textQueue}`
  );
}
