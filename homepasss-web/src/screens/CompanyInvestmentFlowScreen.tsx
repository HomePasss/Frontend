// CHANGE: Added investment wizard for construction companies.
// WHY: Compose app supports both property and company investments; parity is required.
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
  const { companies, isLoading } = useDashboardData()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [amount, setAmount] = useState(25_000)

  const company = useMemo(() => companies.find((item) => item.id === companyId), [companyId, companies])

  if (isLoading) {
    return (
      <section className="screen">
        <div className="card card--centered">Loading company…</div>
      </section>
    )
  }

  if (!company) {
    return (
      <section className="screen">
        <div className="card card--centered">Company not found.</div>
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
        <p className="eyebrow">Step {step + 1} of 3</p>
        <h1>Investment · {company.name}</h1>
        {step === 0 && (
          <div className="field-group">
            <label htmlFor="company-amount">Amount</label>
            <input
              id="company-amount"
              type="number"
              min={company.minInvestmentAmount}
              step={5_000}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
            <p className="muted">
              Min. {formatCurrencyRubles(company.minInvestmentAmount)} · expected return{' '}
              {company.expectedReturn}% per year
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="flow-summary">
            <dl>
              <div>
                <dt>Round progress</dt>
                <dd>{newProgress.toFixed(2)}%</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{formatCurrencyRubles(amount)}</dd>
              </div>
            </dl>
          </div>
        )}
        {step === 2 && (
          <p>Confirm transferring {formatCurrencyRubles(amount)}. The company will finalize via wallet.</p>
        )}
        <div className="flow-card__actions">
          <button type="button" className="btn btn--ghost" onClick={handlePrev}>
            Back
          </button>
          <button type="button" className="btn" onClick={handleNext}>
            {step === 2 ? 'Confirm' : 'Continue'}
          </button>
        </div>
      </article>
    </section>
  )
}
