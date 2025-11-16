// CHANGE: Investment wizard now operates on houses coming from HouseRepository.
// WHY: Mirrors the Compose flow, which starts from a House id and loads details before collecting amounts.
// QUOTE(TЗ): "Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/InvestmentFlowScreen.kt

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { houseRepository } from '../data/houseRepository'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles, formatPercent } from '../utils/formatters'
import type { House } from '../models/types'

/**
 * Multi-step CTA guiding the user through the property investment.
 * @returns React element.
 */
export const InvestmentFlowScreen = () => {
  const { listingId } = useParams()
  const { houses, isLoading } = useDashboardData()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [amount, setAmount] = useState(50_000)
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
        <div className="card card--centered">Проверяем объект…</div>
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

  const price = house.cost ?? 1
  const sharePercentage = Math.min((amount / price) * 100, 100)
  const expectedIncome = amount * 0.08

  const handleNext = () => {
    if (step < 2) {
      setStep((prev) => prev + 1)
    } else {
      navigate(`/invest/success/${house.id}`, {
        state: {
          listingId,
          investmentAmount: amount,
          propertyTitle: house.name,
          sharePercentage,
        },
      })
    }
  }

  const handlePrev = () => {
    if (step === 0) {
      navigate(-1)
    } else {
      setStep((prev) => prev - 1)
    }
  }

  return (
    <section className="screen">
      <article className="card flow-card">
        <p className="eyebrow">Шаг {step + 1} из 3</p>
        <h1>Инвестиция · {house.name}</h1>

        {step === 0 && (
          <div className="field-group">
            <label htmlFor="amount">Сумма инвестиции</label>
            <input
              id="amount"
              type="number"
              min={10_000}
              step={5_000}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
            <p className="muted">Мин. вход 10 000$</p>
          </div>
        )}

        {step === 1 && (
          <div className="flow-summary">
            <dl>
              <div>
                <dt>Сумма</dt>
                <dd>{formatCurrencyRubles(amount)}</dd>
              </div>
              <div>
                <dt>Доля</dt>
                <dd>{formatPercent(sharePercentage)}</dd>
              </div>
              <div>
                <dt>Доход / год</dt>
                <dd>{formatCurrencyRubles(expectedIncome)}</dd>
              </div>
            </dl>
          </div>
        )}

        {step === 2 && (
          <p>
            Подтвердите перевод {formatCurrencyRubles(amount)}. Средства будут зарезервированы за
            объектом &laquo;{house.name}&raquo;.
          </p>
        )}

        <div className="flow-card__actions">
          <button type="button" className="btn btn--ghost" onClick={handlePrev}>
            Назад
          </button>
          <button type="button" className="btn" onClick={handleNext}>
            {step === 2 ? 'Подтвердить' : 'Продолжить'}
          </button>
        </div>
      </article>
    </section>
  )
}
