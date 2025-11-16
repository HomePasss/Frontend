// CHANGE: Remove hardcoded listing-to-property mapping; use listing id as the property id so each asset mints its own token.
// WHY: Every object must map to its dedicated on-chain token; hardcoded maps violate the “no hardcode” requirement.
// QUOTE(TЗ): "не должно быть никакого хардкода У каждого объекта свой токен"
// REF: USER-NO-HARDCODE
// SOURCE: Dynamic token configs from http://jumbo.galagen.net:2205/token

const DEFAULT_PROPERTY_ID = (import.meta.env.VITE_SOLANA_DEFAULT_PROPERTY_ID as string | undefined) ?? null

/**
 * Resolve the devnet property id for a given listing id.
 * @param listingId Numeric listing id from House API.
 * @returns Property id understood by the Anchor program or null if missing.
 *
 * Invariants:
 * - Each listing uses its own id as the on-chain property id.
 * - Fallback to VITE_SOLANA_DEFAULT_PROPERTY_ID only when listing id is absent.
 */
export const resolveBlockchainPropertyId = (listingId: number | null | undefined): string | null => {
  if (listingId === null || listingId === undefined) {
    return DEFAULT_PROPERTY_ID
  }
  return String(listingId)
}
