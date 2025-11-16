// CHANGE: Map HomePasss listing identifiers to on-chain property IDs.
// WHY: Only specific devnet PDAs exist (e.g., `villa-alpha`), so each UI listing must opt into a contract id before minting.
// QUOTE(TЗ): "Надо сделать что бы мы всё минтили"
// REF: user-message-61
// SOURCE: Derived from property_shares deployment metadata.

const DEFAULT_PROPERTY_ID = (import.meta.env.VITE_SOLANA_DEFAULT_PROPERTY_ID as string | undefined) ?? null

const PROPERTY_MAP: Record<number, string> = {
  // CHANGE: Temporary mapping to route listing #10 “2 room Flat For Sale. Varketili” to the devnet deployment.
  // WHY: Only the `villa-alpha` property has been initialized on-chain so far.
  // REF: user-message-61
  10: 'villa-alpha',
}

/**
 * Resolve the devnet property id for a given listing id.
 * @param listingId Numeric listing id from House API.
 * @returns Property id understood by the Anchor program or null if unmapped.
 */
export const resolveBlockchainPropertyId = (listingId: number | null | undefined): string | null => {
  if (listingId === null || listingId === undefined) {
    return DEFAULT_PROPERTY_ID
  }
  return PROPERTY_MAP[listingId] ?? DEFAULT_PROPERTY_ID
}
