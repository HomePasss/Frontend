// CHANGE: Mirror devnet property configuration so the React client can derive PDAs consistently.
// WHY: The contract instructions (buy/deposit/claim) expect the same property IDs, metadata URIs, and pricing baked into the Anchor deployment.
// QUOTE(TЗ): "Надо сделать что бы мы всё минтили"
// REF: user-message-61
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/data/properties.json

export interface PropertyConfig {
  readonly propertyId: string
  readonly totalShares: number
  readonly metadataUri: string
  readonly tokenName: string
  readonly tokenSymbol: string
  readonly pricePerShare: number
  readonly usdcMint: string
}

export const PROPERTY_CONFIGS: readonly PropertyConfig[] = [
  {
    propertyId: 'villa-alpha',
    totalShares: 1000,
    metadataUri:
      'https://raw.githubusercontent.com/skulidropek/holding_contracts_solana_hackathon/main/config/metadata/villa-alpha.json',
    tokenName: 'Villa Alpha Share',
    tokenSymbol: 'VILLA',
    pricePerShare: 2_000_000,
    usdcMint: 'Qkw4FajST5m3z9dtcD5QwX5cn1WfiAcmVsNhqtgJBvB',
  },
]
