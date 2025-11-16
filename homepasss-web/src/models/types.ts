// CHANGE: Added strongly typed domain models mirroring the Kotlin data contracts.
// WHY: Strict typing is required to preserve the invariants from the KMP reference when porting to React.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §core/domain/src/commonMain/kotlin/com/yet/domain/model

/**
 * Represents a physical address.
 * @property street Street with building number.
 * @property city City or municipality.
 * @property state State or province abbreviation.
 * @property zip Postal code string.
 * @invariant `street`, `city`, `state`, and `zip` must be non-empty to keep listings precise.
 */
export interface Address {
  readonly street: string
  readonly city: string
  readonly state: string
  readonly zip: string
}

/**
 * Union describing available listing types that must remain in sync with the Kotlin enum.
 * @invariant Only the literal values defined here are valid navigation destinations.
 */
export type ListingType = 'WHOLE' | 'FRACTIONAL'

/**
 * Union describing property lifecycle status.
 * @invariant These literals correspond to the original enum values and enable UI badges.
 */
export type PropertyStatus = 'FOR_SALE' | 'SOLD' | 'FRACTIONAL_AVAILABLE'

/**
 * Union describing high level property category.
 * @invariant Keeps feature-specific formatting deterministic.
 */
export type PropertyType = 'APARTMENT' | 'HOUSE'

/**
 * Base entity fetched from HouseApi.
 * Mirrors the Kotlin `House` model, extending it with derived fields for listing/status metadata.
 */
export interface House {
  readonly id: number
  readonly name: string
  readonly address: string
  readonly area?: number
  readonly images: readonly string[]
  readonly cost?: number
  readonly tokens?: number
  readonly type?: string
  readonly description?: string
  readonly status?: PropertyStatus
  readonly listingType?: ListingType
  readonly propertyType?: PropertyType
  readonly listedAt?: string
  readonly agentId?: string
}

/**
 * Real-estate property entity.
 * @property id Stable identifier.
 * @property address Structured address.
 * @property price Asking price in USD.
 * @property description Marketing description.
 * @property photos Image URLs ordered by priority.
 * @property propertyType High-level property classification.
 * @property status Sales status.
 * @invariant `price` is strictly positive and `photos` contains at least one URL to satisfy UI expectations.
 */
export interface Property {
  readonly id: string
  readonly address: Address
  readonly price: number
  readonly description: string
  readonly photos: readonly string[]
  readonly propertyType: PropertyType
  readonly status: PropertyStatus
}

/**
 * Listing metadata used across multiple screens.
 * @property id Listing identifier.
 * @property propertyId Foreign key to {@link Property}.
 * @property title Marketing title.
 * @property price Price shown to investors.
 * @property location Human readable location string.
 * @property listingType Listing nature.
 * @property listedAt ISO string timestamp to simplify formatting.
 * @property agentId Responsible agent identifier.
 * @property imageUrl Optional hero image.
 * @invariant `listedAt` must be expressed using ISO strings for deterministic sorting.
 */
export interface Listing {
  readonly id: string
  readonly propertyId: string
  readonly title: string
  readonly price: number
  readonly location: string
  readonly listingType: ListingType
  readonly listedAt: string
  readonly agentId: string
  readonly imageUrl?: string
}

/**
 * Construction company available for investments.
 * @property id Stable identifier.
 * @property name Marketing name.
 * @property description Long form pitch.
 * @property logoUrl Optional small logo.
 * @property imageUrl Hero photo.
 * @property totalProjects Number of delivered projects.
 * @property completedProjects Completed projects count.
 * @property totalInvestmentAmount Raising goal in USD.
 * @property currentInvestmentAmount Already raised USD.
 * @property minInvestmentAmount Minimal amount allowed.
 * @property expectedReturn Expected ROI percent.
 * @property location City/country label.
 * @property rating Rating out of 5.
 * @property investorsCount Community size.
 * @property isActive Whether accepting new funds.
 * @invariant Monetary values are non-negative and `totalInvestmentAmount` >= `currentInvestmentAmount`.
 */
export interface ConstructionCompany {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly logoUrl?: string
  readonly imageUrl?: string
  readonly totalProjects: number
  readonly completedProjects: number
  readonly totalInvestmentAmount: number
  readonly currentInvestmentAmount: number
  readonly minInvestmentAmount: number
  readonly expectedReturn: number
  readonly location: string
  readonly rating: number
  readonly investorsCount: number
  readonly isActive: boolean
}

/**
 * Investment record for a user.
 * @property id Investment identifier.
 * @property userId Owner user id.
 * @property propertyId Target property id.
 * @property propertyTitle Title snapshot.
 * @property amount Original contribution.
 * @property date ISO representation for UI.
 * @property investedAmount Amount currently invested.
 * @property investmentDate ISO string used for timeline charts.
 * @property expectedReturn Annual ROI percent.
 * @invariant `amount` and `investedAmount` must be >= 0.
 */
export interface Investment {
  readonly id: string
  readonly userId: string
  readonly propertyId: string
  readonly propertyTitle: string
  readonly amount: number
  readonly date: string
  readonly investedAmount: number
  readonly investmentDate: string
  readonly expectedReturn: number
}

/**
 * Fractional ownership share.
 * @property id Share identifier.
 * @property propertyId Related property id.
 * @property propertyTitle Property title snapshot.
 * @property ownerId Owner user id.
 * @property percentage Ownership percentage.
 * @property currentValue Current valuation of the share.
 * @property sharePercentage Same as {@link percentage} retained for compatibility.
 * @property purchasePrice Paid price.
 * @property purchaseDate ISO date string.
 * @invariant `percentage` lies in (0, 100] to match investment logic.
 */
export interface PropertyShare {
  readonly id: string
  readonly propertyId: string
  readonly propertyTitle: string
  readonly ownerId: string
  readonly percentage: number
  readonly currentValue: number
  readonly sharePercentage: number
  readonly purchasePrice: number
  readonly purchaseDate: string
}

/**
 * Authenticated user representation.
 * @property id Stable identifier.
 * @property name Display name.
 * @property email Email string.
 * @property userRole Role literal copied from the KMP enum.
 * @invariant Email must contain '@' per frontend validation rules.
 */
export interface User {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly userRole: 'BUYER' | 'SELLER' | 'INVESTOR' | 'AGENT'
}

/**
 * Aggregated portfolio snapshot used on the home screen.
 * @property totalValue Current valuation.
 * @property changeAmount Absolute delta.
 * @property changePercentage Percent delta.
 * @invariant `totalValue` >= 0 and `changePercentage` is finite.
 */
export interface PortfolioSnapshot {
  readonly totalValue: number
  readonly changeAmount: number
  readonly changePercentage: number
}
