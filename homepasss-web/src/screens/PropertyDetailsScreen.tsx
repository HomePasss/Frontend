// CHANGE: Property details now resolve data directly from HouseApi (via houseRepository).
// WHY: Aligns with PropertyDetailsViewModel fetching house details from HouseRepository.
// QUOTE(TЗ): "Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/PropertyDetailsScreen.kt

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { houseRepository } from '../data/houseRepository'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles } from '../utils/formatters'
import type { House } from '../models/types'

/**
 * Displays the selected property card with actionable CTA buttons.
 * @returns React element or fallback message if the listing is missing.
 */
export const PropertyDetailsScreen = () => {
  const { listingId } = useParams()
  const { houses, isLoading } = useDashboardData()
  const navigate = useNavigate()
  const [remoteHouseState, setRemoteHouseState] = useState<{ id: number | null; house: House | null }>({
    id: null,
    house: null,
  })
  const parsedId = listingId ? Number(listingId) : null
  const cachedHouse = useMemo(() => {
    if (!parsedId) {
      return null
    }
    return houses.find((item) => item.id === parsedId) ?? null
  }, [houses, parsedId])
  const house = cachedHouse ?? (remoteHouseState.id === parsedId ? remoteHouseState.house : null)
  const isLoadingDetails = Boolean(parsedId && !cachedHouse && remoteHouseState.id !== parsedId)

  useEffect(() => {
    if (!parsedId || cachedHouse) {
      return
    }
    let active = true
    houseRepository
      .getHouseDetails(parsedId)
      .then((result) => {
        if (active) {
          setRemoteHouseState({ id: parsedId, house: result })
        }
      })
      .catch(() => {
        if (active) {
          setRemoteHouseState({ id: parsedId, house: null })
        }
      })
    return () => {
      active = false
    }
  }, [cachedHouse, parsedId])

  if (isLoading || isLoadingDetails) {
    return (
      <section className="screen">
        <div className="card card--centered">Загрузка объекта…</div>
      </section>
    )
  }

  if (!house) {
    return (
      <section className="screen">
        <div className="card card--centered">Объект не найден.</div>
      </section>
    )
  }

  return (
    <section className="screen">
      <article className="card property-details">
        <img
          className="property-details__image"
          src={house.images[0]}
          alt={house.name}
        />
        <div className="property-details__header">
          <div>
            <p className="eyebrow">{house.address}</p>
            <h1>{house.name}</h1>
          </div>
          <span className="pill">
            {house.listingType === 'FRACTIONAL' ? 'Фракции' : 'Целиком'}
          </span>
        </div>
        <p className="muted">{house.description}</p>
        <dl className="property-details__facts">
          <div>
            <dt>Стоимость</dt>
            <dd>
              {house.cost ? formatCurrencyRubles(house.cost) : 'Цена уточняется у агентства'}
            </dd>
          </div>
          <div>
            <dt>Адрес</dt>
            <dd>{house.address}</dd>
          </div>
          <div>
            <dt>Тип</dt>
            <dd>{house.propertyType === 'HOUSE' ? 'Дом' : 'Квартира'}</dd>
          </div>
        </dl>
        <div className="property-details__actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
            Назад
          </button>
          <button type="button" className="btn" onClick={() => navigate(`/invest/${house.id}`)}>
            Инвестировать
          </button>
        </div>
      </article>
    </section>
  )
}
