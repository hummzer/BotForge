/** Plan limits — Free unlocks 3 run languages; engine still compiles all 8 for upgrade preview. */

export type PlanId = "Free" | "Pro" | "Quant"

export const ALL_LANGS = [
  "Python",
  "MQL5",
  "MQL4",
  "Pine Script",
  "JavaScript",
  "C++",
  "Rust",
  "Elixir",
] as const

export type LangLabel = (typeof ALL_LANGS)[number]

/** Languages the user may select as the active run target on Free. */
export const FREE_RUN_LANGS: LangLabel[] = ["Python", "MQL5", "Pine Script"]

export function canRunLanguage(plan: PlanId | undefined, lang: string): boolean {
  if (!plan || plan === "Free") return FREE_RUN_LANGS.includes(lang as LangLabel)
  return true
}

export function planLanguageNote(plan: PlanId | undefined): string {
  if (!plan || plan === "Free") {
    return "Free plan: all 8 languages are generated. Active run target is limited to Python, MQL5, and Pine Script. Upgrade for C++, Rust, Elixir, JS, MQL4."
  }
  return "Pro/Quant: all generated languages can be set as the active run target."
}
