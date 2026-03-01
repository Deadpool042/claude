/**
 * Generate a URL-safe slug from a string.
 * - Lowercased
 * - Accents removed (NFD + strip combining marks)
 * - Spaces / non-alphanum replaced by hyphens
 * - Consecutive hyphens collapsed
 * - Leading / trailing hyphens trimmed
 */
export function generateSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
