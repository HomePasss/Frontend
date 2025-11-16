// CHANGE: Remove default property overrides so listing ids are the only source of property identifiers.
// WHY: The user insisted “Это полностью удали VITE_SOLANA_DEFAULT_PROPERTY_ID – этого не должно быть,” so we must not fall back to any env value.
// QUOTE(TЗ): "Я перезагружал нету... Это полностью удали VITE_SOLANA_DEFAULT_PROPERTY_ID"
// REF: USER-REMOVE-DEFAULT
// SOURCE: Dynamic token configs from http://jumbo.galagen.net:2205/token

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
    return null
  }
  return String(listingId)
}
