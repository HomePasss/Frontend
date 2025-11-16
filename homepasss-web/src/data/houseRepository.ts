// CHANGE: Added a repository that mirrors HomeRepository/HouseRepository logic from the KMP app.
// WHY: React components now consume real API data (houses, user houses, user) rather than mocks, preserving behaviour.
// QUOTE(TЗ): "Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §§composeApp/.../HomeViewModel.kt, core/data/.../HouseRepositoryImpl.kt

import { houseApi, type HouseDTO } from '../api/houseApi'
import type {
  House,
  ListingType,
  PortfolioSnapshot,
  PropertyStatus,
  PropertyType,
} from '../models/types'

const toPropertyType = (type?: string): PropertyType | undefined => {
  if (!type) {
    return undefined
  }
  const normalized = type.trim().toUpperCase()
  if (normalized === 'APARTMENT' || normalized === 'APARTAMENT') {
    return 'APARTMENT'
  }
  if (normalized === 'HOUSE') {
    return 'HOUSE'
  }
  return undefined
}

const toListingType = (tokens?: number): ListingType | undefined => {
  if (tokens === undefined) {
    return undefined
  }
  return tokens > 0 ? 'FRACTIONAL' : 'WHOLE'
}

const mapDtoToHouse = (dto: HouseDTO): House => {
  const listingType = toListingType(dto.tokens)
  const propertyType = toPropertyType(dto.type)
  const status: PropertyStatus = 'FOR_SALE'

  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    area: dto.area ?? undefined,
    images: dto.images,
    cost: dto.cost ?? undefined,
    tokens: dto.tokens ?? undefined,
    type: dto.type ?? undefined,
    description: dto.name,
    status,
    listingType,
    propertyType,
    listedAt: undefined,
    agentId: undefined,
  }
}

const mapDtosToHouses = (dtos: readonly HouseDTO[]): House[] => dtos.map(mapDtoToHouse)

export const houseRepository = {
  async getHouses(count = 10): Promise<House[]> {
    const dtos = await houseApi.getHouses(count)
    return mapDtosToHouses(dtos)
  },
  async getHouseDetails(id: number): Promise<House | null> {
    const dtos = await houseApi.getHouses(100)
    const match = dtos.find((house) => house.id === id)
    return match ? mapDtoToHouse(match) : null
  },
}

/**
 * Kotlin mimics a mocked delta, so we keep the same constants until backend support arrives.
 * @param userHouses Houses belonging to the authenticated user.
 * @returns Portfolio snapshot with fallback totals as in HomeViewModel.
 */
export const calculatePortfolioData = (userHouses: readonly House[]): PortfolioSnapshot => {
  const totalValue = userHouses.reduce((sum, house) => sum + (house.cost ?? 0), 0)
  const displayValue = totalValue > 0 ? totalValue : 8_450_000
  return {
    totalValue: displayValue,
    changeAmount: 145_230,
    changePercentage: 1.75,
  }
}
