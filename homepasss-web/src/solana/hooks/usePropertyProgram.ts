// CHANGE: Anchor provider/program wiring reused from the Solana dashboard project.
// WHY: Contract calls (buy/deposit/claim) must use the same connection/provider config as the CLI deployment.
// QUOTE(TЗ): "Надо сделать что бы мы всё минтили"
// REF: user-message-61
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/hooks/usePropertyProgram.ts

import { AnchorProvider, Program, type Wallet } from '@coral-xyz/anchor'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import idl from '../idl/property_shares.json'
import type { PropertyShares } from '../idl/property_shares_type'

interface ReadonlyWallet extends Wallet {
  readonly publicKey: PublicKey
  readonly payer: Keypair
}

const createReadonlyWallet = (): ReadonlyWallet => {
  const keypair = Keypair.generate()
  return {
    publicKey: keypair.publicKey,
    payer: keypair,
    async signTransaction() {
      throw new Error('Read-only wallet cannot sign transactions.')
    },
    async signAllTransactions() {
      throw new Error('Read-only wallet cannot sign transactions.')
    },
  }
}

/**
 * Returns the Anchor program/provider pair used for property_shares.
 * @returns Tuple { program, provider } where both may be null before the wallet/connection are ready.
 * @invariant The provider always uses the latest wallet (or a readonly fake to enable fetches).
 */
export const usePropertyProgram = (): {
  readonly program: Program<PropertyShares> | null
  readonly provider: AnchorProvider | null
} => {
  const { connection } = useConnection()
  const anchorWallet = useAnchorWallet()

  const provider = useMemo(() => {
    if (!connection) {
      return null
    }
    const wallet = anchorWallet ?? createReadonlyWallet()
    return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())
  }, [anchorWallet, connection])

  const program = useMemo(() => {
    if (!provider) {
      return null
    }
    return new Program<PropertyShares>(idl as PropertyShares, provider)
  }, [provider])

  return { program, provider }
}
