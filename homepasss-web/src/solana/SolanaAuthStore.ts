// CHANGE: Centralized the Solana auth context definition and contract.
// WHY: Separating the store from the provider keeps React Refresh satisfied and improves reuse.
// QUOTE(TЗ): "Можешь теперь подключить Solana?"
// REF: user-message-6
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/hooks/usePropertyShares.ts

import { createContext } from 'react'

export interface SolanaAuthContextValue {
  readonly publicKey: string | null
  readonly isConnected: boolean
  readonly signature: string | null
  readonly lastAuthorizedAt: Date | null
  readonly error: string | null
  readonly isAuthorizing: boolean
  authorize(): Promise<void>
}

export const SolanaAuthContext = createContext<SolanaAuthContextValue | undefined>(undefined)
