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

interface PriceFilter {
  readonly min: string
  readonly max: string
}

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
  const [priceFilter, setPriceFilter] = useState<PriceFilter>({ min: '', max: '' })

  const filtered = useMemo(() => {
    return houses
      .filter((house) => {
        const matchesQuery =
          query.trim().length === 0 ||
          house.name.toLowerCase().includes(query.toLowerCase()) ||
          house.address.toLowerCase().includes(query.toLowerCase())

        const typeLabel = house.listingType ?? 'WHOLE'
        const matchesType = selectedType === 'ALL' || typeLabel === selectedType

        const min = priceFilter.min ? Number(priceFilter.min) : null
        const max = priceFilter.max ? Number(priceFilter.max) : null
        const price = house.cost ?? 0

        const matchesMin = min === null || price >= min
        const matchesMax = max === null || price <= max

        return matchesQuery && matchesType && matchesMin && matchesMax
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
  }, [houses, priceFilter.max, priceFilter.min, query, selectedType, sortOption])

  return (
    <section className="screen">
      <div className="card search-controls">
        <div className="field-group">
          <label htmlFor="search">Поиск</label>
          <input
            id="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Название или локация"
          />
        </div>

        <div className="field-group">
          <label>Тип</label>
          <div className="pill-group">
            {(['ALL', 'WHOLE', 'FRACTIONAL'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type === 'ALL' ? 'ALL' : type)}
                className={`pill ${selectedType === type ? 'pill--active' : ''}`}
              >
                {type === 'ALL' ? 'Все' : type === 'WHOLE' ? 'Целиком' : 'Фракции'}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-grid">
          <div className="field-group">
            <label htmlFor="price-min">Мин. цена</label>
            <input
              id="price-min"
              type="number"
              inputMode="numeric"
              value={priceFilter.min}
              onChange={(event) => setPriceFilter((prev) => ({ ...prev, min: event.target.value }))}
            />
          </div>
          <div className="field-group">
            <label htmlFor="price-max">Макс. цена</label>
            <input
              id="price-max"
              type="number"
              inputMode="numeric"
              value={priceFilter.max}
              onChange={(event) => setPriceFilter((prev) => ({ ...prev, max: event.target.value }))}
            />
          </div>
          <div className="field-group">
            <label htmlFor="sort">Сортировка</label>
            <select
              id="sort"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
            >
              <option value="newest">Сначала новые</option>
              <option value="priceAsc">Цена ↑</option>
              <option value="priceDesc">Цена ↓</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="home-group__header">
          <div>
            <h2>Найдено объектов: {filtered.length}</h2>
            <p className="muted">Используйте фильтры, чтобы ускорить поиск.</p>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="muted">Нет предложений с такими параметрами.</p>
        ) : (
          <div className="listing-grid">
            {filtered.map((house) => (
              <article key={house.id} className="listing-card">
                <img
                  src={house.images[0]}
                  alt={house.name}
                  loading="lazy"
                  className="listing-card__image"
                />
                <div className="listing-card__body">
                  <p className="eyebrow">{house.address}</p>
                  <h3>{house.name}</h3>
                  <p className="muted">
                    {house.listingType === 'FRACTIONAL' ? 'Доступны доли' : 'Полная продажа'}
                  </p>
                  <p className="listing-card__price">
                    {house.cost ? formatCurrencyRubles(house.cost) : 'Цена по запросу'}
                  </p>
                </div>
                <div className="listing-card__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => navigate(`/listings/${house.id}`)}
                  >
                    Детали
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => navigate(`/invest/${house.id}`)}
                  >
                    Инвестировать
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
