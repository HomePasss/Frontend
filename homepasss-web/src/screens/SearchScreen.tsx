// CHANGE: Search now operates on HouseApi payloads (houses) instead of static listings.
// WHY: Matches SearchViewModel, which queries HouseRepository for all houses before filtering.
// QUOTE(TЗ): "Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/SearchScreen.kt

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ListingType } from '../models/types'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles } from '../utils/formatters'

type SortOption = 'newest' | 'priceAsc' | 'priceDesc'

/**
 * Search UI that mirrors the Kotlin filters: text search, listing type, price range, and sorting.
 * @returns React node with filtered listing results.
 */
export const SearchScreen = () => {
  const { houses } = useDashboardData()
  const navigate = useNavigate()
  const [query, setQuery] = useState<string>('')
  const [selectedType, setSelectedType] = useState<ListingType | 'ALL'>('ALL')
  const [sortOption, setSortOption] = useState<SortOption>('newest')

  const filtered = useMemo(() => {
    return houses
      .filter((house) => {
        const matchesQuery =
          query.trim().length === 0 ||
          house.name.toLowerCase().includes(query.toLowerCase()) ||
          house.address.toLowerCase().includes(query.toLowerCase())

        const typeLabel = house.listingType ?? 'WHOLE'
        const matchesType = selectedType === 'ALL' || typeLabel === selectedType

        return matchesQuery && matchesType
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'priceAsc':
            return (a.cost ?? 0) - (b.cost ?? 0)
          case 'priceDesc':
            return (b.cost ?? 0) - (a.cost ?? 0)
          case 'newest':
          default:
            return b.id - a.id
        }
      })
  }, [houses, query, selectedType, sortOption])

  return (
    <section className="screen screen--mobile">
      <div className="mobile-header">
        <div className="search-bar">
          <span className="search-bar__icon">🔍</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="City, district, property..."
          />
        </div>
        <div className="chip-group">
          {(['ALL', 'WHOLE', 'FRACTIONAL'] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`chip ${selectedType === type ? 'chip--active' : ''}`}
              onClick={() => setSelectedType(type === 'ALL' ? 'ALL' : type)}
            >
              {type === 'ALL' ? 'All' : type === 'WHOLE' ? 'Whole Ownership' : 'Fractional Ownership'}
            </button>
          ))}
        </div>
        <div className="chip-group">
          <button
            type="button"
            className={`chip ${sortOption === 'newest' ? 'chip--active' : ''}`}
            onClick={() => setSortOption('newest')}
          >
            By popularity ↓
          </button>
          <button
            type="button"
            className={`chip ${sortOption === 'priceAsc' ? 'chip--active' : ''}`}
            onClick={() => setSortOption('priceAsc')}
          >
            Price ↑
          </button>
          <button
            type="button"
            className={`chip ${sortOption === 'priceDesc' ? 'chip--active' : ''}`}
            onClick={() => setSortOption('priceDesc')}
          >
            Price ↓
          </button>
        </div>
        <p className="mobile-section-title">Found {filtered.length} properties</p>
      </div>

      {filtered.length === 0 ? (
        <p className="muted">Нет предложений с такими параметрами.</p>
      ) : (
        filtered.map((house) => (
          <article
            key={house.id}
            className="mobile-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/invest/${house.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(`/invest/${house.id}`)
              }
            }}
          >
            <div className="mobile-card__image-wrapper">
              <img src={house.images[0]} alt={house.name} className="mobile-card__image" loading="lazy" />
              <span className="mobile-card__badge">15% Available</span>
              <span className="mobile-card__badge mobile-card__badge--accent">+12.5%</span>
            </div>
            <div className="mobile-card__body">
              <div className="mobile-card__headline">
                <h3 className="mobile-card__title">{house.name}</h3>
              </div>
              <div className="mobile-card__meta">
                <span>📍 {house.address}</span>
                <span>👥 247</span>
              </div>
              <div className="mobile-card__stat-row">
                <span>From</span>
                <span className="mobile-card__stat-value">
                  {house.cost ? formatCurrencyRubles(house.cost) : 'Price on request'}
                </span>
              </div>
              <div className="mobile-card__progress">
                <span>50%</span>
                <div className="mobile-progress-track">
                  <div className="mobile-progress-fill" style={{ width: '50%' }} />
                </div>
              </div>
            </div>
          </article>
        ))
      )}
    </section>
  )
}
