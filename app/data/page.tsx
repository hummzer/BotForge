import { redirect } from "next/navigation"

/** Market Data / import section removed — traffic sent to strategy browser. */
export default function DataPage() {
  redirect("/strategies")
}
