// CHANGE: Normalized Solana property views into token holdings used by the profile UI.
// WHY: My Objects must display live token balances/locations sourced from the blockchain rather than mocks (REQ-3).
// QUOTE(TЗ): "MyOBjects это токены. Мы ничего не хардкодим"
// REF: REQ-3
// SOURCE: n/a

import { USDC_DECIMALS } from '../solana/lib/constants'
import type { PropertyMetadataMap } from '../solana/hooks/usePropertyMetadata'

const USDC_FACTOR = 10 ** Number(USDC_DECIMALS)

interface TokenViewSource {
  readonly config: {
    readonly propertyId: string
    readonly tokenName: string
    readonly metadataUri?: string
    readonly totalShares: number
  }
  readonly isInitialized: boolean
  readonly userShares: bigint
  readonly pricePerShareUi: number
  readonly pendingRewards: bigint
}

export interface TokenHolding {
  readonly propertyId: string
  readonly title: string
  readonly location: string
  readonly currentValue: number
  readonly monthlyIncome: number
  readonly sharePercentage: number
  readonly growthPercentage: number
  readonly metadataUri?: string
}

const microToUsd = (value: bigint): number => Number(value) / USDC_FACTOR

const resolveLocation = (propertyId: string, metadata: PropertyMetadataMap): string => {
  const entry = metadata[propertyId]
  if (!entry?.attributes) {
    return propertyId
  }
  const locationAttribute = entry.attributes.find(
    (attribute) => attribute.trait_type?.toLowerCase() === 'location',
  )
  return locationAttribute?.value ?? propertyId
}

const resolveTitle = (propertyId: string, tokenName: string, metadata: PropertyMetadataMap): string => {
  return metadata[propertyId]?.name ?? tokenName
}

/**
 * Converts raw property views into portfolio holdings with fiat metrics.
 * @param properties Anchor-derived property views.
 * @param metadata Metadata map produced by {@link usePropertyMetadata}.
 * @returns Array of holdings filtered to the properties the wallet currently owns.
 */
export const mapPropertyViewsToHoldings = <T extends TokenViewSource>(
  properties: readonly T[],
  metadata: PropertyMetadataMap,
): TokenHolding[] => {
  return properties
    .filter((view) => view.isInitialized && view.userShares > 0n)
    .map((view) => {
      const shareCount = Number(view.userShares)
      const currentValue = shareCount * view.pricePerShareUi
      const monthlyIncome = microToUsd(view.pendingRewards)
      const sharePercentage =
        view.config.totalShares > 0 ? (shareCount / view.config.totalShares) * 100 : 0
      const growthPercentage = currentValue > 0 ? (monthlyIncome / currentValue) * 100 : 0
      return {
        propertyId: view.config.propertyId,
        title: resolveTitle(view.config.propertyId, view.config.tokenName, metadata),
        location: resolveLocation(view.config.propertyId, metadata),
        currentValue,
        monthlyIncome,
        sharePercentage,
        growthPercentage,
        metadataUri: view.config.metadataUri,
      }
    })
}
