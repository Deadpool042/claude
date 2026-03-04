/**
 * Informations de la micro-entreprise pour les devis et factures.
 *
 * Ces données sont affichées sur les documents commerciaux générés.
 * À compléter avec le SIRET et le nom d'entreprise définitifs.
 */

export const BUSINESS_INFO = {
  /** Nom commercial / raison sociale */
  name: "Laurent Puleri",
  /** Numéro SIRET (14 chiffres) — à renseigner */
  siret: "",
  /** Adresse complète */
  address: "17b rue de Terrenoire",
  city: "Saint-Étienne",
  postalCode: "42100",
  country: "France",
  /** Email professionnel */
  email: "laurent@puleri.com",
  /** Téléphone */
  phone: "06 33 29 02 05",
  /** Mention TVA */
  tvaNotice: "TVA non applicable, art. 293 B du CGI",
  /** Validité par défaut d'un devis (en jours) */
  defaultValidityDays: 30,
} as const;
