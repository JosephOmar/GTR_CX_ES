
import { toUnicodeBold } from "./toUnicodeBold";
import type { Worker } from "../../workers/types/types";

export interface MessageData {
  worker: Worker;
  contractLabel: string;
  diffSec: number;
  hmsStr: string;
  url: string;
}

// 🔹 Función auxiliar para la primera línea
const buildFirstLine = (worker: any, contractLabel: string) => {
  return worker.trainee === "DESPEGANDO"
    ? `${toUnicodeBold(`${worker.team?.name?.toUpperCase() ?? "Equipo Desconocido"} - ${contractLabel} - ${worker.requirement_id ?? ""}`)}\n`
    : `${toUnicodeBold(`${worker.team?.name?.toUpperCase() ?? "Equipo Desconocido"} - ${contractLabel}`)}\n`;
};

// 🔹 Función auxiliar para Supervisor + QA
const buildSupervisorLine = (worker: any) => {
  const supervisorLine = `${toUnicodeBold(`Supervisor: ${worker.supervisor?.toUpperCase() ?? " "}`)}`;

  if (worker.trainee === "DESPEGANDO" && worker.qa_in_charge) {
    const qaLine = `${toUnicodeBold(`QA: ${worker.qa_in_charge?.toUpperCase()}`)}`;
    return [supervisorLine, qaLine].join("\n");
  }

  return supervisorLine;
};

// =========================================================
// Mensajes
// =========================================================

export const buildAsNoRetomaMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  buildFirstLine(worker, contractLabel),
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} aún no retoma su chat. Su apoyo alertando, que retome y agilice🚨`,
  `  ${toUnicodeBold(`Tiempo de espera:`)} ${diffSec} segundos (${hmsStr} hrs)⏰`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  buildSupervisorLine(worker),
].join("\n");

export const buildAgilizarChatMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  buildFirstLine(worker, contractLabel),
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} presenta tiempo de atención elevado en su chat. Su apoyo alertando, que agilice🚨`,
  `  ${toUnicodeBold(`Tiempo de gestión:`)} ${diffSec} segundos (${hmsStr} hrs)⏰`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  buildSupervisorLine(worker),
].join("\n");

export const buildAgilizarMailMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  buildFirstLine(worker, contractLabel),
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} presenta tiempo de atención elevado en su mail. Su apoyo alertando, que agilice🚨`,
  `  ${toUnicodeBold(`Tiempo de gestión:`)} ${diffSec} segundos (${hmsStr} hrs)⏰`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  buildSupervisorLine(worker),
].join("\n");

export const buildAsNoCierraChatMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  buildFirstLine(worker, contractLabel),
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} aún no cierra su chat. Su apoyo alertando, que proceda con el cierre🚨`,
  `  ${toUnicodeBold(`Tiempo de retoma:`)} ${diffSec} segundos (${hmsStr} hrs)⏰`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  buildSupervisorLine(worker),
].join("\n");

export const buildAsNoSaludaMessage = ({ worker, contractLabel, url }: Omit<MessageData, 'diffSec' | 'hmsStr'>) => [
  buildFirstLine(worker, contractLabel),
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} no da primera respuesta a su chat. Su apoyo alertando, que realice el saludo inicial🚨`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  buildSupervisorLine(worker),
].join("\n");

export const buildGreetingOutOfTimeMessage = ({ worker, contractLabel, url }: Omit<MessageData, 'diffSec' | 'hmsStr'>) => [
  buildFirstLine(worker, contractLabel),
  `  ❌CHAT PERDIDO POR SALUDO ‼️`,
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} realiza saludo despues de 30s`,
  `  Reforzar el cumplimiento del saludo dentro de tiempo 🚨`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  buildSupervisorLine(worker),
].join("\n");

export const buildSaludoInTimeMessage = ({ worker, contractLabel, url }: Omit<MessageData, 'diffSec' | 'hmsStr'>) => [
  `⭐${toUnicodeBold('SALUDO DENTRO DE LOS 30 SEG')}⭐\n`,
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} realizó el saludo dentro del tiempo establecido.`,
  `  ¡Excelente cumplimiento, sigamos así! 🙌🏻  `,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
].join("\n");