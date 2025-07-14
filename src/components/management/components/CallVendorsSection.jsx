import React, { useState } from "react";
import NumericInput from "../utils/NumericInput";
import CopyButton from "../utils/CopyButton";
import { useCallVendors } from "../hooks/useCallVendors";
import { toUnicodeBold } from "../utils/toUnicodeBold";
import SendButton from "../utils/SendButton";

export function CallVendorsSection() {
  const {
    agentes,
    setAgentes,
    disponibles,
    setDisponibles,
    enAuxiliar,
    setEnAuxiliar,
    cola,
    setCola,
    report,
  } = useCallVendors();

  const [training, setTraining] = useState("");
  const [others, setOthers] = useState("");

  const agentesReal = String(Number(agentes) + Number(disponibles));

  return (
    <section className="border p-4 rounded-lg">
      <h3 className="text-xl font-bold">📞 Call Vendors</h3>
      <div  className="grid grid-cols-1 gap-4 mt-2">
        <NumericInput
          label="Agentes en llamada:"
          value={agentes}
          setter={setAgentes}
          placeholder="Ej: 20"
        />
        <NumericInput
          label="Asesores disponibles:"
          value={disponibles}
          setter={setDisponibles}
          placeholder="Ej: 25"
        />
        <NumericInput
          label="As en auxiliar:"
          value={enAuxiliar}
          setter={setEnAuxiliar}
          placeholder="Ej: 4"
        />
        <NumericInput
          label="Llamadas en cola:"
          value={cola}
          setter={setCola}
          placeholder="Ej: 0"
        />
        <NumericInput
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
        />
        <SendButton
          chanel={"Call Vendors"}
          agentes={agentesReal}
          training={training}
          others={others}
        />
      </div>
      <CopyButton text={report} />
    </section>
  );
}
