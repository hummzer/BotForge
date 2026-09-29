import type { StrategySpec } from "../spec"
import { LANGS, LANG_META, slug, type Lang } from "./common"
import { genPython } from "./python"
import { genJavaScript } from "./javascript"
import { genCpp } from "./cpp"
import { genRust } from "./rust"
import { genElixir } from "./elixir"
import { genPine } from "./pine"
import { genMql4 } from "./mql4"
import { genMql5 } from "./mql5"

const GENERATORS: Record<Lang, (spec: StrategySpec) => string> = {
  python: genPython, javascript: genJavaScript, cpp: genCpp, rust: genRust,
  elixir: genElixir, pine: genPine, mql4: genMql4, mql5: genMql5,
}

export function generate(spec: StrategySpec, lang: Lang): string {
  return GENERATORS[lang](spec)
}

/** Generate every supported language in one pass, keyed by filename. */
export function genAll(spec: StrategySpec): Record<string, string> {
  const base = slug(spec.name)
  const out: Record<string, string> = {}
  for (const lang of LANGS) out[LANG_META[lang].file(base)] = GENERATORS[lang](spec)
  return out
}

export { LANGS, LANG_META }
export type { Lang }
