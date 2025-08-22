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
    ART,
    setART,
    FRT,
    setFRT,
    agentsOnline,
    setAgentsOnline,
    agentsScheduled,
    setAgentsScheduled,
    agentsRequired,
    setAgentsRequired,
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
      "ART",
      "FRT",
      "agentsOnline",
      "agentsScheduled",
      "agentsRequired",
      "chatsInterval",
      "onlineChats",
      "slaInterval",
    ],
    buildCustomerHC
  );

  return (
    <section className="border p-4 rounded-lg">
      <h3 className="text-xl font-bold">✉️ Mail Customer</h3>
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
          label="ART:"
          value={ART}
          setter={setART}
          required
          placeholder="Ej: 21"
        />
        <NumericInput
          label="FRT:"
          value={FRT}
          setter={setFRT}
          required
          placeholder="Ej: 0"
        />
        <NumericInput
          label="Agents Online:"
          value={agentsOnline}
          setter={setAgentsOnline}
          required
          placeholder="Ej: 12"
        />
        <NumericInput
          label="Agents Scheduled:"
          value={agentsScheduled}
          setter={setAgentsScheduled}
          required
          placeholder="Ej: 12"
        />
        <NumericInput
          label="Agents Required:"
          value={agentsRequired}
          setter={setAgentsRequired}
          required
          placeholder="Ej: 6"
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
              team === "Customer" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setTeam("Customer")}
          >
            Customer
          </button>
          <button
            className={`px-3 py-1 rounded-sm ${
              team === "Rider" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setTeam("Rider")}
          >
            Rider
          </button>
        </div>
      </div>
      <CopyButton text={report} />
    </section>
  );
}
