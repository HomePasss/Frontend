// CHANGE: Home screen now renders houses fetched via HouseApi instead of static listings.
// WHY: Mirrors HomeViewModel which loads houses/portfolio through HouseRepository/HomeRepository.
// QUOTE(TЗ): "Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/HomeScreen.kt

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrencyRubles, formatCurrencyRublesCompact } from '../utils/formatters'
import type { House } from '../models/types'
import { useDashboardData } from '../state/dashboardDataStore'

interface ListingGroupProps {
  readonly title: string
  readonly subtitle?: string
  readonly houses: readonly House[]
}

/**
 * Entry dashboard with welcome section, portfolio snapshot, and featured listings.
 * @returns React node replicating the Compose dashboard.
 */
export const HomeScreen = () => {
  const { houses, currentUser, portfolio, isLoading } = useDashboardData()
  const navigate = useNavigate()

  const fractionalHouses = useMemo(
    () => houses.filter((house) => house.listingType === 'FRACTIONAL'),
    [houses],
  )

  const wholeHouses = useMemo(
    () => houses.filter((house) => house.listingType !== 'FRACTIONAL'),
    [houses],
  )

  if (isLoading || !portfolio) {
    return (
      <section className="screen">
        <div className="card card--centered">Загрузка портфеля…</div>
      </section>
    )
  }

  return (
    <section className="screen screen--home">
      <div className="home-welcome card">
        <div>
          <p className="eyebrow">Приветствуем</p>
          <h1>{currentUser?.name ?? 'Инвестор'}</h1>
          <p className="muted">Сфокусируйтесь на инвестициях в недвижимость премиум-класса.</p>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => navigate('/profile')}
        >
          Профиль
        </button>
      </div>

      <PortfolioCard
        total={formatCurrencyRubles(portfolio.totalValue)}
        change={formatCurrencyRublesCompact(portfolio.changeAmount)}
        changePercent={portfolio.changePercentage}
      />

      <ListingGroup
        title="Фракционные предложения"
        subtitle="Станьте совладельцем премиальных объектов"
        houses={fractionalHouses.slice(0, 3)}
      />

      <ListingGroup
        title="Полные объекты"
        subtitle="Доступны для покупки целиком или аренды"
        houses={wholeHouses.slice(0, 3)}
      />

      <div className="card home-companies">
        <div>
          <h2>Строительные партнеры</h2>
          <p className="muted">Инвестируйте в pipeline компаний с высоким рейтингом.</p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => navigate('/investments')}
        >
          Смотреть компании
        </button>
      </div>
    </section>
  )
}

const ListingGroup = ({ title, subtitle, houses }: ListingGroupProps) => {
  const navigate = useNavigate()

  if (houses.length === 0) {
    return null
  }

  return (
    <div className="home-group card">
      <div className="home-group__header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
        <span className="eyebrow">Объектов: {houses.length}</span>
      </div>
      <div className="listing-grid">
        {houses.map((house) => (
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
                {house.listingType === 'FRACTIONAL' ? 'Фракционный' : 'Целиком'}
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
                Подробнее
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
    </div>
  )
}

interface PortfolioCardProps {
  readonly total: string
  readonly change: string
  readonly changePercent: number
}

const PortfolioCard = ({ total, change, changePercent }: PortfolioCardProps) => {
  return (
    <div className="portfolio card">
      <div>
        <p className="eyebrow">Портфель</p>
        <h2>{total}</h2>
        <p className="muted">
          +{change} (+{changePercent}%)
        </p>
      </div>
      <div className="portfolio__chart">
        <div className="portfolio__spark" />
        <p className="muted">Рост за 12 месяцев</p>
      </div>
    </div>
  )
}
