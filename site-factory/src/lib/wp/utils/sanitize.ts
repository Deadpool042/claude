export function assertNonEmptyString(v: unknown, label: string): asserts v is string {
  if (typeof v !== "string" || v.trim() === "") {
    throw new Error(`${label} requis`);
  }
}

export function sanitizeSlugLike(input: string, label: string): string {
  // slug wordpress/plugin/theme: letters, digits, dash, underscore, dot (pragmatique)
  const s = input.trim();
  if (!/^[a-zA-Z0-9._-]+$/.test(s)) {
    throw new Error(`${label} invalide`);
  }
  return s;
}

export function sanitizeOptionKey(input: string): string {
  const s = input.trim();
  // WP option keys are typically [a-z0-9_], but on reste permissif (sans espaces/quotes)
  if (!/^[a-zA-Z0-9_.:-]+$/.test(s)) {
    throw new Error("Clé d'option invalide");
  }
  return s;
}

export function sanitizePermalinkStructure(input: string): string {
  const s = input.trim();
  // On évite les caractères de shell + les quotes
  if (s.includes('"') || s.includes("'") || s.includes(";") || s.includes("`")) {
    throw new Error("Structure de permalien invalide");
  }
  // minimum pragmatique
  if (!s.startsWith("/")) {
    throw new Error("La structure de permalien doit commencer par /");
  }
  return s;
}

export function sanitizeFreeText(input: string, { max = 200 }: { max?: number } = {}): string {
  const s = input.trim();
  if (s.length === 0) return s;
  if (s.length > max) throw new Error(`Texte trop long (max ${max})`);
  // on interdit quotes/backticks pour rester safe dans wp-cli args
  if (s.includes('"') || s.includes("`")) throw new Error("Texte invalide");
  return s;
}

export function sanitizeRelativePath(input: string, label: string): string {
  const s = input.trim();
  if (s.length === 0) throw new Error(`${label} requis`);
  if (s.startsWith("/")) throw new Error(`${label} invalide`);
  if (s.includes("..")) throw new Error(`${label} invalide`);
  if (!/^[a-zA-Z0-9._/\\-]+$/.test(s)) throw new Error(`${label} invalide`);
  return s;
}
