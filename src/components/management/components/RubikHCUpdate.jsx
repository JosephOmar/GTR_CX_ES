// File: src/components/RubikHCUpdate.js
import React from "react";
import NumericInput from "../utils/NumericInput";
import CopyButton from "../utils/CopyButton";
import { useMailSection } from "../hooks/useMailSection";
import { toUnicodeBold } from "../utils/toUnicodeBold";
import { buildRubikHCUpdate } from "../utils/buildRubikHCUpdate";

export function RubikHCUpdate() {
  const {
    team,
    setTeam,
    group,
    setGroup,
    agentsOnline,
    setAgentsOnline,
    agentsScheduled,
    setAgentsScheduled,
    backlogES,
    setBacklogES,
    backlogPT,
    setBacklogPT,
    longestTime,
    setLongestTime,
    report,
  } = useMailSection(
    [
      "team",
      "group",
      "agentsOnline",
      "agentsScheduled",
      "backlogES",
      "backlogPT",
      "longestTime",
    ],
    buildRubikHCUpdate
  );

  return (
    <section className="border p-4 rounded-lg">
      <h3 className="text-xl font-bold">✉️ Rubik Update</h3>
      <div className="grid grid-cols-1 gap-4 mt-2">
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
          label="Backlog ES:"
          value={backlogES}
          setter={setBacklogES}
          required
          placeholder="Ej: 6"
        />
        <NumericInput
          label="Backlog PT:"
          value={backlogPT}
          setter={setBacklogPT}
          required
          placeholder="Ej: 6"
        />
        <NumericInput
          label="Longest Time:"
          value={longestTime}
          setter={setLongestTime}
          required
          placeholder="Ej: 6"
        />
        {/* <div className="flex gap-3 justify-center">
          <button
            className={`px-3 py-1 rounded-sm ${
              group === "Teams" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setGroup("Teams")}
          >
            Teams
          </button>
          <button 
            className={`px-3 py-1 rounded-sm ${
              group === "Slack" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setGroup("Slack")}
          >
            Slack
          </button>
        </div> */}
        <div className="flex gap-3 justify-center">
          <button
            className={`px-3 py-1 rounded-sm ${
              team === "CS" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setTeam("CS")}
          >
            Customer
          </button>
          <button
            className={`px-3 py-1 rounded-sm ${
              team === "RS" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setTeam("RS")}
          >
            Rider
          </button>
          <button
            className={`px-3 py-1 rounded-sm ${
              team === "VS" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setTeam("VS")}
          >
            Vendor
          </button>
        </div>
      </div>
      <CopyButton text={report} />
    </section>
  );
}
