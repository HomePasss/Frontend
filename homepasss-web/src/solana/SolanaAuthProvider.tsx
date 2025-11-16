// CHANGE: Implements the Solana auth state machine (signature + error handling) as a provider component.
// WHY: Needed for blockchain authorization similar to the provided Solana example project.
// QUOTE(TЗ): "Можешь теперь подключить Solana? Что бы мы могли авторизацию через блокчейн на клиенте сделать"
// REF: user-message-6
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/App.tsx

import { useWallet } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import { useCallback, useMemo, useState, type PropsWithChildren } from 'react'
import { SolanaAuthContext, type SolanaAuthContextValue } from './SolanaAuthStore'

export const SolanaAuthProvider = ({ children }: PropsWithChildren) => {
  const { publicKey, signMessage } = useWallet()
  const [signature, setSignature] = useState<string | null>(null)
  const [lastAuthorizedAt, setLastAuthorizedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorizing, setIsAuthorizing] = useState(false)

  const authorize = useCallback(async () => {
    if (!publicKey) {
      setError('Connect a wallet before signing')
      return
    }
    if (!signMessage) {
      setError('This wallet does not support message signing')
      return
    }
    setIsAuthorizing(true)
    setError(null)
    try {
      const encoder = new TextEncoder()
      const payload = encoder.encode(
        `HomePasss authorization\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`,
      )
      const signed = await signMessage(payload)
      setSignature(bs58.encode(signed))
      setLastAuthorizedAt(new Date())
    } catch (authError) {
      const reason = authError instanceof Error ? authError.message : 'Authorization failed'
      setError(reason)
    } finally {
      setIsAuthorizing(false)
    }
  }, [publicKey, signMessage])

  const value = useMemo<SolanaAuthContextValue>(
    () => ({
      publicKey: publicKey?.toBase58() ?? null,
      isConnected: Boolean(publicKey),
      signature,
      lastAuthorizedAt,
      error,
      isAuthorizing,
      authorize,
    }),
    [authorize, error, isAuthorizing, lastAuthorizedAt, publicKey, signature],
  )

  return <SolanaAuthContext.Provider value={value}>{children}</SolanaAuthContext.Provider>
}
