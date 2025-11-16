// CHANGE: Retained deterministic mocks for sections that still lack backend endpoints (companies, investments, shares).
// WHY: Only the house/user data moved to HTTP, the remaining screens still rely on Kotlin’s mock repositories.
// QUOTE(TЗ): "Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §core/data/src/commonMain/kotlin/com/yet/data/repository

import type { ConstructionCompany, Investment, PropertyShare } from '../models/types'

export const constructionCompanies: readonly ConstructionCompany[] = [
  {
    id: 'comp1',
    name: 'Nordic Heights Development',
    description:
      'Premium mixed-use complexes with focus on sustainable materials and concierge-level services.',
    logoUrl: 'https://dummyimage.com/64x64/2e4053/ffffff&text=NH',
    imageUrl: 'https://dummyimage.com/960x540/1f2a44/ffffff&text=Nordic+Heights',
    totalProjects: 42,
    completedProjects: 36,
    totalInvestmentAmount: 25_000_000,
    currentInvestmentAmount: 18_400_000,
    minInvestmentAmount: 50_000,
    expectedReturn: 11.2,
    location: 'Helsinki, Finland',
    rating: 4.8,
    investorsCount: 1280,
    isActive: true,
  },
  {
    id: 'comp2',
    name: 'Aurora Smart Living',
    description:
      'Smart residential clusters with solar grids and community-managed amenities in emerging markets.',
    logoUrl: 'https://dummyimage.com/64x64/3c763d/ffffff&text=AS',
    imageUrl: 'https://dummyimage.com/960x540/2f4d2f/ffffff&text=Aurora+Smart+Living',
    totalProjects: 28,
    completedProjects: 19,
    totalInvestmentAmount: 18_000_000,
    currentInvestmentAmount: 12_250_000,
    minInvestmentAmount: 25_000,
    expectedReturn: 9.4,
    location: 'Warsaw, Poland',
    rating: 4.6,
    investorsCount: 930,
    isActive: true,
  },
  {
    id: 'comp3',
    name: 'Pacific Modular',
    description:
      'Seismic-ready modular towers positioned near tech campuses with flexible retail podiums.',
    logoUrl: 'https://dummyimage.com/64x64/1d3557/ffffff&text=PM',
    imageUrl: 'https://dummyimage.com/960x540/264653/ffffff&text=Pacific+Modular',
    totalProjects: 35,
    completedProjects: 22,
    totalInvestmentAmount: 32_000_000,
    currentInvestmentAmount: 21_600_000,
    minInvestmentAmount: 75_000,
    expectedReturn: 10.1,
    location: 'Seattle, USA',
    rating: 4.7,
    investorsCount: 1560,
    isActive: true,
  },
]

export const mockInvestments: readonly Investment[] = [
  {
    id: 'invest1',
    userId: 'user1',
    propertyId: 'inv1',
    propertyTitle: 'Commercial property with high rental yield',
    amount: 100_000,
    date: '2024-10-01',
    investedAmount: 100_000,
    investmentDate: '2024-10-01',
    expectedReturn: 8.5,
  },
  {
    id: 'invest2',
    userId: 'user1',
    propertyId: 'inv2',
    propertyTitle: 'Mixed-use development in growing market',
    amount: 75_000,
    date: '2024-09-15',
    investedAmount: 75_000,
    investmentDate: '2024-09-15',
    expectedReturn: 7.2,
  },
]

export const mockPropertyShares: readonly PropertyShare[] = [
  {
    id: 'share1',
    propertyId: 'inv1',
    propertyTitle: 'Commercial property with high rental yield',
    ownerId: 'user1',
    percentage: 5.2,
    currentValue: 260_000,
    sharePercentage: 5.2,
    purchasePrice: 100_000,
    purchaseDate: '2024-10-01',
  },
  {
    id: 'share2',
    propertyId: 'inv2',
    propertyTitle: 'Mixed-use development in growing market',
    ownerId: 'user1',
    percentage: 2.5,
    currentValue: 187_500,
    sharePercentage: 2.5,
    purchasePrice: 75_000,
    purchaseDate: '2024-09-15',
  },
]
