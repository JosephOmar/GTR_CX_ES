// File: src/components/MailCustomerSection.js
import React from "react";
import NumericInput from "../utils/NumericInput";
import CopyButton from "../utils/CopyButton";
import { useMailSection } from "../hooks/useMailSection";
import { buildAvailabilityTier1 } from "../utils/AvailabilityTier1Utils";

export function AvailabilityTier1() {
  const {
    totalChatsCS,
    setTotalChatsCS,
    agentsOnlineCS,
    setAgentsOnlineCS,
    totalChatsRD,
    setTotalChatsRD,
    agentsOnlineRD,
    setAgentsOnlineRD,
    report,
  } = useMailSection(
    ["totalChatsCS", "agentsOnlineCS", "totalChatsRD", "agentsOnlineRD"],
    buildAvailabilityTier1
  );

  return (
    <section className="border p-4 rounded-lg">
      <h3 className="text-xl font-bold">Availability</h3>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput
          label="Total Chats CS:"
          value={totalChatsCS}
          setter={setTotalChatsCS}
          required
          placeholder="Ej: 32"
        />
        <NumericInput
          label="Online Agents CS:"
          value={agentsOnlineCS}
          setter={setAgentsOnlineCS}
          required
          placeholder="Ej: 12"
        />
        <NumericInput
          label="Total Chats RD:"
          value={totalChatsRD}
          setter={setTotalChatsRD}
          required
          placeholder="Ej: 32"
        />
        <NumericInput
          label="Online Agents RD:"
          value={agentsOnlineRD}
          setter={setAgentsOnlineRD}
          required
          placeholder="Ej: 12"
        />
      </div>
      <CopyButton text={report} />
    </section>
  );
}
