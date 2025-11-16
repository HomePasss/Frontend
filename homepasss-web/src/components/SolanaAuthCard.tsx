// CHANGE: Added Solana auth widget with wallet connect button and signature CTA.
// WHY: Users must be able to connect Phantom/Solflare and sign a message to authenticate.
// REF: user-message-6
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/App.tsx

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useSolanaAuth } from '../solana/useSolanaAuth'

export const SolanaAuthCard = () => {
  const { publicKey, isConnected, signature, lastAuthorizedAt, error, isAuthorizing, authorize } =
    useSolanaAuth()

  return (
    <div className="card profile-card">
      <div className="profile-card__solana">
        <div>
          <h2>Solana wallet</h2>
          <p className="muted">
            Connect Phantom or Solflare and sign a message to confirm blockchain identity.
          </p>
        </div>
        <WalletMultiButton className="btn" />
      </div>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>{isConnected ? 'Connected' : 'Not connected'}</dd>
        </div>
        <div>
          <dt>Wallet</dt>
            <dd>
                {publicKey
                    ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
                    : '—'}
            </dd>
        </div>
        <div>
          <dt>Last auth</dt>
          <dd>{lastAuthorizedAt ? lastAuthorizedAt.toLocaleString() : '—'}</dd>
        </div>
      </dl>
      <div className="profile-card__actions">
        <button
          type="button"
          className="btn"
          onClick={() => void authorize()}
          disabled={!isConnected || isAuthorizing}
        >
          {isAuthorizing ? 'Signing…' : 'Sign message'}
        </button>
        {signature && (
          <p className="muted">
            Signature: <span className="profile-card__signature">{signature}</span>
          </p>
        )}
        {error && <p className="app__error">{error}</p>}
      </div>
    </div>
  )
}
