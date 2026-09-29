import { redirect } from "next/navigation"

/** Calendar page removed — events live on landing + dashboard. */
export default function CalendarRemoved() {
  redirect("/dashboard")
}
