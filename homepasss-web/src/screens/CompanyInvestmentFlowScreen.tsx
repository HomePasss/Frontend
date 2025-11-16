// CHANGE: Added investment wizard for construction companies.
// WHY: Compose app supports both property and company investments; parity is required.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/ui/screens/CompanyInvestmentFlowScreen.kt

import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDashboardData } from '../state/dashboardDataStore'
import { formatCurrencyRubles } from '../utils/formatters'

/**
 * Wizard that mirrors the company-specific investment bottom sheet.
 * @returns React node.
 */
export const CompanyInvestmentFlowScreen = () => {
  const { companyId } = useParams()
  const { companies, currentUser, isLoading } = useDashboardData()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [amount, setAmount] = useState(25_000)

  const company = useMemo(() => companies.find((item) => item.id === companyId), [companyId, companies])

  if (isLoading) {
    return (
      <section className="screen">
        <div className="card card--centered">Загрузка компании…</div>
      </section>
    )
  }

  if (!company) {
    return (
      <section className="screen">
        <div className="card card--centered">Компания не найдена.</div>
      </section>
    )
  }

  const newProgress = Math.min(
    ((company.currentInvestmentAmount + amount) / company.totalInvestmentAmount) * 100,
    100,
  )

  const handleNext = () => {
    if (step < 2) {
      setStep((prev) => prev + 1)
    } else {
      navigate(`/invest/success/${company.id}`, {
        state: {
          listingId: company.id,
          investmentAmount: amount,
          sharePercentage: newProgress,
          propertyTitle: company.name,
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
        <h1>Инвестиция · {company.name}</h1>
        {step === 0 && (
          <div className="field-group">
            <label htmlFor="company-amount">Сумма</label>
            <input
              id="company-amount"
              type="number"
              min={company.minInvestmentAmount}
              step={5_000}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
            <p className="muted">
              Мин. {formatCurrencyRubles(company.minInvestmentAmount)} · ожидание{' '}
              {company.expectedReturn}% годовых
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="flow-summary">
            <dl>
              <div>
                <dt>Новая доля раунда</dt>
                <dd>{newProgress.toFixed(2)}%</dd>
              </div>
              <div>
                <dt>Сумма</dt>
                <dd>{formatCurrencyRubles(amount)}</dd>
              </div>
            </dl>
          </div>
        )}
        {step === 2 && (
          <p>
            Подтвердите перевод {formatCurrencyRubles(amount)}. Компания направит документы на почту{' '}
            {currentUser?.email ?? 'investor@homepasss.dev'}.
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
