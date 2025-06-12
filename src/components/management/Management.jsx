import { Breached } from "./components/Breached"
import { Concurrency } from "./components/Concurrency"
import { MailInbox } from "./components/MailInbox"

export function Management() {
    return (
        <div>
            <Breached />
            <Concurrency  />
            <MailInbox  />
        </div>
    )
}