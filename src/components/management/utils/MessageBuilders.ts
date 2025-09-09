
import { toUnicodeBold } from "./toUnicodeBold";
import type { Worker } from "../../workers/types/types";

export interface MessageData {
  worker: Worker;
  contractLabel: string;
  diffSec: number;
  hmsStr: string;
  url: string;
}

export const buildAsNoRetomaMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  `${toUnicodeBold(`${worker.team?.name?.toUpperCase() ?? "Equipo Desconocido"} - ${contractLabel}`)}\n`,
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} aún no retoma su chat. Su apoyo alertando, que retome y agilice🚨`,
  `  ${toUnicodeBold(`Tiempo de espera:`)} ${diffSec} segundos (${hmsStr} hrs)⏰`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  `  ${toUnicodeBold(`Supervisor: ${worker.supervisor?.toUpperCase() ?? " "}`)}`,
].join("\n");

export const buildAgilizarChatMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  `${toUnicodeBold(`${worker.team?.name?.toUpperCase() ?? "Equipo Desconocido"} - ${contractLabel}`)}\n`,
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} presenta tiempo de atención elevado en su chat. Su apoyo alertando, que agilice🚨`,
  `  ${toUnicodeBold(`Tiempo de gestión:`)} ${diffSec} segundos (${hmsStr} hrs)⏰`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  `  ${toUnicodeBold(`Supervisor: ${worker.supervisor?.toUpperCase() ?? " "}`)}`,
].join("\n");

export const buildAgilizarMailMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  `${toUnicodeBold(`${worker.team?.name?.toUpperCase() ?? "Equipo Desconocido"} - ${contractLabel}`)}\n`,
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} presenta tiempo de atención elevado en su mail. Su apoyo alertando, que agilice🚨`,
  `  ${toUnicodeBold(`Tiempo de gestión:`)} ${diffSec} segundos (${hmsStr} hrs)⏰`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  `  ${toUnicodeBold(`Supervisor: ${worker.supervisor?.toUpperCase() ?? " "}`)}`,
].join("\n");

export const buildAsNoCierraChatMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  `${toUnicodeBold(`${worker.team?.name?.toUpperCase() ?? "Equipo Desconocido"} - ${contractLabel}`)}\n`,
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} aún no cierra su chat. Su apoyo alertando, que proceda con el cierre🚨`,
  `  ${toUnicodeBold(`Tiempo de retoma:`)} ${diffSec} segundos (${hmsStr} hrs)⏰`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  `  ${toUnicodeBold(`Supervisor: ${worker.supervisor?.toUpperCase() ?? " "}`)}`,
].join("\n");

export const buildAsNoSaludaMessage = ({ worker, contractLabel, url }: Omit<MessageData, 'diffSec' | 'hmsStr'>) => [
  `${toUnicodeBold(`${worker.team?.name?.toUpperCase() ?? "Equipo Desconocido"} - ${contractLabel}`)}\n`,
  `  ${toUnicodeBold(worker.name?.toUpperCase() ?? "Nombre Desconocido")} no da primera respuesta a su chat. Su apoyo alertando, que realice el saludo inicial🚨`,
  `  ${toUnicodeBold(`Link:`)} ${url}`,
  `  ${toUnicodeBold(`Supervisor: ${worker.supervisor?.toUpperCase() ?? " "}`)}`,
].join("\n");