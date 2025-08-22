import { Breached } from "./components/Breached"
import { Concurrency } from "./components/Concurrency"
import { ConcurrencyHC } from "./components/ConcurrencyHC"
import { MailInbox } from "./components/MailInbox"

export function Management() {
    return (
        <div>
            <Breached />
            <Concurrency  />
            <MailInbox  />
            <ConcurrencyHC />
        </div>
    )
}