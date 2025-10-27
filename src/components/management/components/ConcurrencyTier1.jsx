// File: src/components/MailCustomerSection.js
import React from "react";
import NumericInput from "../utils/NumericInput";
import CopyButton from "../utils/CopyButton";
import { useMailSection } from "../hooks/useMailSection";
import { buildCustomerTier1 } from "../utils/ConcurrencyTier1Utils";

export function ConcurrencyTier1() {
  const {
    totalChats,
    setTotalChats,
    agentsOnline,
    setAgentsOnline,
    queue,
    setQueue,
    team,
    setTeam,
    report,
  } = useMailSection(
    [
      "totalChats",
      "agentsOnline",
      "queue",
      "team"
    ],
    buildCustomerTier1
  );

  return (
    <section className="border p-4 rounded-lg">
      <h3 className="text-xl font-bold">Tier1</h3>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput
          label="Total Chats:"
          value={totalChats}
          setter={setTotalChats}
          required
          placeholder="Ej: 32"
        />
        <NumericInput
          label="Online Agents:"
          value={agentsOnline}
          setter={setAgentsOnline}
          required
          placeholder="Ej: 12"
        />
        <NumericInput
          label="Queue:"
          value={queue}
          setter={setQueue}
          required
          placeholder="Ej: 6"
        />
        <div className="flex gap-3 justify-center">
          <button
            className={`px-3 py-1 rounded-sm ${
              team === "CUSTOMER TIER1" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setTeam("CUSTOMER TIER1")}
          >
            Customer
          </button>
          <button
            className={`px-3 py-1 rounded-sm ${
              team === "RIDER TIER1" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setTeam("RIDER TIER1")}
          >
            Rider
          </button>
        </div>
      </div>
      <CopyButton text={report} />
    </section>
  );
}
