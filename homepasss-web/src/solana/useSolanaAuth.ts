// CHANGE: Isolated the Solana auth hook to comply with fast-refresh lint rules.
// WHY: Hooks can live outside component files without breaking React Refresh invariants.
// REF: user-message-6
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/App.tsx

import { useContext } from 'react'
import { SolanaAuthContext } from './SolanaAuthStore'

export const useSolanaAuth = () => {
  const context = useContext(SolanaAuthContext)
  if (!context) {
    throw new Error('useSolanaAuth must be used inside SolanaAuthProvider')
  }
  return context
}
