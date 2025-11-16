// CHANGE: Introduced Solana wallet providers (connection, wallet list, modal) used across the app.
// WHY: Blockchain auth requires the same adapter stack as the reference Solana dashboard.
// REF: user-message-6
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/main.tsx

import { clusterApiUrl } from '@solana/web3.js'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useMemo, type PropsWithChildren } from 'react'
import { SolanaAuthProvider } from './SolanaAuthProvider'
import '@solana/wallet-adapter-react-ui/styles.css'

const DEVNET_ENDPOINT = clusterApiUrl('devnet')

export const SolanaProvider = ({ children }: PropsWithChildren) => {
  // CHANGE: Do not instantiate Phantom adapter manually because the wallet standard already registers it.
  // WHY: Having both adapters causes Chrome extension message-channel errors ("listener indicated an async response…").
  // QUOTE(TЗ): "Phantom was registered as a Standard Wallet. The Wallet Adapter for Phantom can be removed from your app."
  // REF: user-message-60
  const wallets = useMemo(() => [new SolflareWalletAdapter({ network: 'devnet' })], [])

  return (
    <ConnectionProvider endpoint={DEVNET_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaAuthProvider>{children}</SolanaAuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
