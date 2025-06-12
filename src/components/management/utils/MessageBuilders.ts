// File: src/utils/messageBuilders.ts
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
  `💬 ${toUnicodeBold(`${worker.team.name.toUpperCase()} - ${contractLabel}`)}`,
  ``,
  `🧑‍💻 ${toUnicodeBold(worker.name.toUpperCase())} aún no retoma su chat. Por favor, que retome y agilice.`,
  `⏱️ Tiempo de espera: ${diffSec} segundos (${hmsStr} hrs)`,
  `🔗 Ver caso en Kustomer: ${url}`,
  `📋 Supervisor: ${toUnicodeBold(worker.supervisor.toUpperCase())}`,
].join("\n");

export const buildAgilizarChatMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  `💬 ${toUnicodeBold(`${worker.team.name.toUpperCase()} - ${contractLabel}`)}`,
  ``,
  `🏃‍♂️ Su apoyo agilizando el chat del agente ${toUnicodeBold(worker.name.toUpperCase())}.`,
  `⏱️ Tiempo de gestión: ${diffSec} segundos (${hmsStr} hrs).`,
  `🔗 Ver caso en Kustomer: ${url}`,
  `📋 Supervisor: ${toUnicodeBold(worker.supervisor.toUpperCase())}`,
].join("\n");

export const buildAgilizarMailMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  `📧 ${toUnicodeBold(`${worker.team.name.toUpperCase()} - ${contractLabel}`)}`,
  ``,
  `🏃‍♂️ Su apoyo agilizando el correo del agente ${toUnicodeBold(worker.name.toUpperCase())}.`,
  `⏱️ Tiempo de gestión: ${diffSec} segundos (${hmsStr} hrs) desde que le fue asignado al agente.`,
  `🔗 Ver caso en Kustomer: ${url}`,
  `📋 Supervisor: ${toUnicodeBold(worker.supervisor.toUpperCase())}`,
].join("\n");

export const buildAsNoCierraChatMessage = ({ worker, contractLabel, diffSec, hmsStr, url }: MessageData) => [
  `💬 ${toUnicodeBold(`${worker.team.name.toUpperCase()} - ${contractLabel}`)}`,
  ``,
  `⚠️ ${toUnicodeBold(worker.name.toUpperCase())} aún no cierra su chat. Por favor, retome y proceda con el cierre.`,
  `⏱️ Tiempo de retoma: ${diffSec} segundos (${hmsStr} hrs).`,
  `🔗 Ver caso en Kustomer: ${url}`,
  `📋 Supervisor: ${toUnicodeBold(worker.supervisor.toUpperCase())}`,
].join("\n");

export const buildAsNoSaludaMessage = ({ worker, contractLabel, url }: Omit<MessageData, 'diffSec' | 'hmsStr'>) => [
  `💬 ${toUnicodeBold(`${worker.team.name.toUpperCase()} - ${contractLabel}`)}`,
  ``,
  `❗ Se detectó un chat sin saludo por parte del agente ${toUnicodeBold(worker.name.toUpperCase())}. Por favor, que realice un saludo inicial.`,
  `🔗 Ver caso en Kustomer: ${url}`,
  `📋 Supervisor: ${toUnicodeBold(worker.supervisor.toUpperCase())}`,
].join("\n");