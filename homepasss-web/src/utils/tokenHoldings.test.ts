// CHANGE: Covered the token holdings mapper to trace REQ-3 (Solana tokens drive My Objects UI).
// WHY: Each RTM requirement demands executable evidence; this test checks share %, income, and metadata usage.
// QUOTE(TЗ): "MyOBjects это токены. Мы ничего не хардкодим"
// REF: REQ-3
// SOURCE: n/a

import { describe, expect, it } from 'vitest'
import type { PropertyMetadataMap } from '../solana/hooks/usePropertyMetadata'
import { mapPropertyViewsToHoldings } from './tokenHoldings'

const sampleMetadata: PropertyMetadataMap = {
  'villa-alpha': {
    name: 'Villa Alpha',
    attributes: [
      { trait_type: 'Location', value: 'Mediterranean' },
      { trait_type: 'Type', value: 'Villa' },
    ],
  },
}

describe('mapPropertyViewsToHoldings (REQ-3)', () => {
  it('builds holdings from initialized Solana properties', () => {
    const holdings = mapPropertyViewsToHoldings(
      [
        {
          config: {
            propertyId: 'villa-alpha',
            tokenName: 'Villa Token',
            metadataUri: 'https://example.com/villa.json',
            totalShares: 100,
          },
          isInitialized: true,
          userShares: 5n,
          pricePerShareUi: 20_000,
          pendingRewards: 1_500_000n,
        },
        {
          config: {
            propertyId: 'inactive',
            tokenName: 'Inactive',
            metadataUri: '',
            totalShares: 100,
          },
          isInitialized: false,
          userShares: 10n,
          pricePerShareUi: 10,
          pendingRewards: 0n,
        },
      ],
      sampleMetadata,
    )

    expect(holdings).toHaveLength(1)
    const [holding] = holdings
    expect(holding.title).toBe('Villa Alpha')
    expect(holding.location).toBe('Mediterranean')
    expect(holding.sharePercentage).toBeCloseTo(5)
    expect(holding.currentValue).toBe(100_000)
    expect(holding.monthlyIncome).toBeCloseTo(1.5)
  })
})
