import React, { useState } from "react";
import NumericInput from "../utils/NumericInput";
import CopyButton from "../utils/CopyButton";
import { useChatRider } from "../hooks/useChatRider";
import { toUnicodeBold } from "../utils/toUnicodeBold";
import SendButton from "../utils/SendButton";

export function ChatRiderSection() {
  const {
    agentes,
    setAgentes,
    bandejaActual,
    setBandejaActual,
    agentesNesting,
    setAgentesNesting,
    bandejaNesting,
    setBandejaNesting,
    cola,
    setCola,
    report,
  } = useChatRider();

  const [training, setTraining] = useState("");
  const [others, setOthers] = useState("");

  return (
    <section className="border p-4 rounded-lg">
      <h3 className="text-xl font-bold">🏍️ Chat Rider</h3>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput
          label="Agentes*:"
          value={agentes}
          setter={setAgentes}
          placeholder="Ej: 20"
        />
        <NumericInput
          label="Bandeja Actual*:"
          value={bandejaActual}
          setter={setBandejaActual}
          placeholder="Ej: 25"
        />
        {/* <NumericInput
          label="Agentes Nesting:"
          value={agentesNesting}
          setter={setAgentesNesting}
          placeholder="Ej: 4"
        />
        <NumericInput
          label="Bandeja Nesting:"
          value={bandejaNesting}
          setter={setBandejaNesting}
          placeholder="Ej: 3"
        /> */}
        <NumericInput
          label="Cola (override):"
          value={cola}
          setter={setCola}
          placeholder="Ej: 3"
        />
        {/* <NumericInput
          label="Training:"
          value={training}
          setter={setTraining}
          placeholder="Ej: 3"
        />
        <NumericInput
          label="Others:"
          value={others}
          setter={setOthers}
          placeholder="Ej: 3"
        /> */}
        {/* <SendButton chanel={'Chat Rider'} agentes={agentes} training={training} others={others}/> */}
      </div>
      <CopyButton text={report} />
    </section>
  );
}
