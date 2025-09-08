// File: src/components/MailCustomerSection.js
import React from "react";
import NumericInput from "../utils/NumericInput";
import CopyButton from "../utils/CopyButton";
import { useMailSection } from "../hooks/useMailSection";
import { buildCustomerHC } from "../utils/concurrencyHCUtils";
import { toUnicodeBold } from "../utils/toUnicodeBold";

export function ChatCustomerHCSection() {
  const {
    team,
    setTeam,
    currentSla,
    setCurrentSla,
    totalChats,
    setTotalChats,
    FRT,
    setFRT,
    agentsCurrent,
    setAgentsCurrent,
    agentsOnline,
    setAgentsOnline,
    chatsInterval,
    setChatsInterval,
    onlineChats,
    setOnlineChats,
    slaInterval,
    setSlaInterval,
    report,
  } = useMailSection(
    [
      "team",
      "currentSla",
      "totalChats",
      "FRT",
      "agentsCurrent",
      "agentsOnline",
      "chatsInterval",
      "onlineChats",
      "slaInterval",
    ],
    buildCustomerHC
  );

  return (
    <section className="border p-4 rounded-lg">
      <h3 className="text-xl font-bold">Migration HC</h3>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput
          label="Current SLA:"
          value={currentSla}
          setter={setCurrentSla}
          required
          placeholder="Ej: 123"
        />
        <NumericInput
          label="Total Chats:"
          value={totalChats}
          setter={setTotalChats}
          required
          placeholder="Ej: 32"
        />
        <NumericInput
          label="FRT:"
          value={FRT}
          setter={setFRT}
          required
          placeholder="Ej: 0"
        />
        <NumericInput
          label="AgentsCurrent:"
          value={agentsCurrent}
          setter={setAgentsCurrent}
          required
          placeholder="Ej: 21"
        />
        <NumericInput
          label="Agents Online:"
          value={agentsOnline}
          setter={setAgentsOnline}
          required
          placeholder="Ej: 12"
        />
        <NumericInput
          label="Chats Interval:"
          value={chatsInterval}
          setter={setChatsInterval}
          required
          placeholder="Ej: 6"
        />
        <NumericInput
          label="Online Chats:"
          value={onlineChats}
          setter={setOnlineChats}
          required
          placeholder="Ej: 12"
        />
        <NumericInput
          label="Interval SLA:"
          value={slaInterval}
          setter={setSlaInterval}
          required
          placeholder="Ej: 6"
        />
        <div className="flex gap-3 justify-center">
          <button
            className={`px-3 py-1 rounded-sm ${
              team === "CHAT CUSTOMER HC" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setTeam("CHAT CUSTOMER HC")}
          >
            Customer
          </button>
          <button
            className={`px-3 py-1 rounded-sm ${
              team === "CHAT RIDER HC" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setTeam("CHAT RIDER HC")}
          >
            Rider
          </button>
        </div>
      </div>
      <CopyButton text={report} />
    </section>
  );
}
