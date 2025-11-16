// CHANGE: Ported the property_shares state machine (fetch PDAs + buy/deposit/claim) from the Solana dashboard.
// WHY: The HomePasss investment flow must mint actual SPL shares on-chain instead of sending SOL to a treasury.
// QUOTE(TЗ): "Надо сделать что бы мы всё минтили"
// REF: user-message-61
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/hooks/usePropertyShares.ts

import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { SystemProgram, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useCallback, useEffect, useState } from 'react'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'
import type { PropertyShares } from '../idl/property_shares_type'
import { ACC_SCALE, USDC_DECIMALS } from '../lib/constants'
import { loadPropertyConfigs, type PropertyConfig } from '../data/properties'
import { deriveCoreAddresses, deriveUserRewardAddress, makeAtaBundle, SPL_PROGRAM_ID } from '../lib/addresses'
import { usePropertyProgram } from './usePropertyProgram'

const USDC_FACTOR = 10 ** Number(USDC_DECIMALS)

type WalletState = ReturnType<typeof useAnchorWallet>

interface ActionContext {
  readonly program: Program<PropertyShares>
  readonly wallet: NonNullable<WalletState>
  readonly provider: AnchorProvider
}

export interface PropertyView {
  readonly config: PropertyConfig
  readonly isInitialized: boolean
  readonly pricePerShareUi: number
  readonly availableShares: bigint
  readonly userShares: bigint
  readonly userUsdcBalance: bigint
  readonly userUsdcAta: PublicKey | null
  readonly userSharesAta: PublicKey | null
  readonly pendingRewards: bigint
  readonly vaultUsdcBalance: bigint
  readonly poolUsdcBalance: bigint
  readonly isAuthority: boolean
  readonly addresses: ReturnType<typeof deriveCoreAddresses>
  readonly usdcMint: PublicKey
  readonly atas: ReturnType<typeof makeAtaBundle>
}

export interface PropertyActions {
  readonly properties: PropertyView[]
  readonly loading: boolean
  readonly error: string | null
  buyShares(propertyId: string, amountShares: number): Promise<string>
  depositYield(propertyId: string, microUsdc: number): Promise<string>
  claim(propertyId: string): Promise<string>
  refresh(): Promise<void>
}

const fetchTokenAmount = async (connection: ReturnType<typeof useConnection>['connection'], address: PublicKey) => {
  try {
    const balance = await connection.getTokenAccountBalance(address)
    return BigInt(balance.value.amount)
  } catch {
    return 0n
  }
}

const ensureAtaExists = async (
  connection: ReturnType<typeof useConnection>['connection'],
  provider: AnchorProvider,
  mint: PublicKey,
  owner: PublicKey,
): Promise<PublicKey> => {
  const ata = getAssociatedTokenAddressSync(mint, owner)
  const info = await connection.getAccountInfo(ata)
  if (info) {
    return ata
  }
  const ix = createAssociatedTokenAccountInstruction(provider.wallet.publicKey, ata, owner, mint)
  const tx = new Transaction().add(ix)
  await provider.sendAndConfirm(tx)
  return ata
}

type LogValue = string | number | boolean | bigint | null | undefined;
type LogPayload = Record<string, LogValue>;

// CHANGE: Restrict log payload types to avoid `unknown` and enforce serializable debugging data.
// WHY: Codebase forbids `any`/`unknown`; logging should stay JSON-friendly for DevTools.
// QUOTE(TЗ): "Никогда не использовать `any`, `unknown`, `eslint-disable`, `ts-ignore`."
// REF: AGENTS.md
// SOURCE: n/a

export const usePropertyShares = (): PropertyActions => {
  const { program, provider } = usePropertyProgram()
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const [properties, setProperties] = useState<PropertyView[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configsLoaded, setConfigsLoaded] = useState(false)
  const [configs, setConfigs] = useState<PropertyConfig[]>([])

  const logEvent = (label: string, payload: LogPayload = {}) => {
    console.debug(`[property_shares] ${label}`, payload)
  }

  const ensureActionContext = (): ActionContext => {
    if (!program || !wallet || !provider) {
      throw new Error('Connect a Solana wallet to execute transactions.')
    }
    return { program, wallet, provider }
  }

  // Load property configs from API
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const loadedConfigs = await loadPropertyConfigs()
        setConfigs(loadedConfigs as PropertyConfig[])
        setConfigsLoaded(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load property configurations.'
        setError(message)
        logEvent('configs:error', { message })
      }
    }

    void loadConfigs()
  }, [])

  const refresh = useCallback(async () => {
    if (!program || !configsLoaded) {
      return
    }
    logEvent('refresh:start', { entries: configs.length })
    setLoading(true)
    setError(null)
    try {
      const views = await Promise.all(
        configs.map(async (config) => {
          const addresses = deriveCoreAddresses(config.propertyId)
          const usdcMint = new PublicKey(config.usdcMint)
          const atas = makeAtaBundle(addresses.mint, usdcMint, addresses.vault, addresses.pool)
          const propertyAccount = await program.account.property.fetchNullable(addresses.property)
          if (!propertyAccount) {
            logEvent('state', { propertyId: config.propertyId, initialized: false })
            return {
              config,
              isInitialized: false,
              pricePerShareUi: config.pricePerShare / USDC_FACTOR,
              availableShares: 0n,
              userShares: 0n,
              userUsdcBalance: 0n,
              userUsdcAta: null,
              userSharesAta: null,
              pendingRewards: 0n,
              vaultUsdcBalance: 0n,
              poolUsdcBalance: 0n,
              isAuthority: false,
              addresses,
              usdcMint,
              atas,
            } satisfies PropertyView
          }

          const vaultBalance = await fetchTokenAmount(connection, atas.vaultSharesAta)
          const userShareAta = wallet?.publicKey ? atas.userSharesAta(wallet.publicKey) : null
          const userUsdcAta = wallet?.publicKey ? atas.userUsdcAta(wallet.publicKey) : null
          const userBalance = userShareAta ? await fetchTokenAmount(connection, userShareAta) : 0n
          const userUsdcBalance = userUsdcAta ? await fetchTokenAmount(connection, userUsdcAta) : 0n
          const poolAccount = await program.account.pool.fetch(addresses.pool)
          const vaultUsdcBalance = await fetchTokenAmount(connection, atas.vaultUsdcAta)
          const poolUsdcBalance = await fetchTokenAmount(connection, atas.poolUsdcAta)
          const userReward =
            wallet?.publicKey !== undefined
              ? await program.account.userReward.fetchNullable(deriveUserRewardAddress(addresses.pool, wallet.publicKey))
              : null

          const accPerShare = BigInt(poolAccount.accPerShare.toString())
          const paidPerShare = userReward ? BigInt(userReward.paidPerShare.toString()) : 0n
          const positiveDelta = accPerShare > paidPerShare ? accPerShare - paidPerShare : 0n
          const pending = wallet?.publicKey && userBalance > 0n ? (positiveDelta * userBalance) / ACC_SCALE : 0n
          const view: PropertyView = {
            config,
            isInitialized: true,
            pricePerShareUi: config.pricePerShare / USDC_FACTOR,
            availableShares: vaultBalance,
            userShares: userBalance,
            userUsdcBalance,
            userUsdcAta,
            userSharesAta: userShareAta,
            pendingRewards: pending,
            vaultUsdcBalance,
            poolUsdcBalance,
            isAuthority: Boolean(wallet?.publicKey?.equals(propertyAccount.authority)),
            addresses,
            usdcMint,
            atas,
          }
          logEvent('state', {
            propertyId: config.propertyId,
            availableShares: vaultBalance.toString(),
            userShares: userBalance.toString(),
            userUsdc: userUsdcBalance.toString(),
            vaultUsdc: vaultUsdcBalance.toString(),
            poolUsdc: poolUsdcBalance.toString(),
            pending: pending.toString(),
          })
          return view
        }),
      )
      setProperties(views)
      logEvent('refresh:completed', { initialized: views.filter((view) => view.isInitialized).length })
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : 'Failed to load property state.'
      setError(message)
      logEvent('refresh:error', { message })
    } finally {
      setLoading(false)
    }
  }, [connection, program, wallet?.publicKey, configs, configsLoaded])

  useEffect(() => {
    if (configsLoaded) {
      void refresh()
    }
  }, [configsLoaded, refresh])

  const findView = (propertyId: string): PropertyView => {
    const view = properties.find((item) => item.config.propertyId === propertyId)
    if (!view) {
      throw new Error('Failed to find the specified property.')
    }
    if (!view.isInitialized) {
      throw new Error('The property is not initialized on-chain yet.')
    }
    return view
  }

  const runAction = async <T>(action: () => Promise<T>): Promise<T> => {
    setLoading(true)
    setError(null)
    logEvent('action:start')
    try {
      const result = await action()
      await refresh()
      return result
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Transaction failed.'
      setError(message)
      logEvent('action:error', { message })
      throw actionError
    } finally {
      setLoading(false)
    }
  }

  const buyShares = async (propertyId: string, amount: number): Promise<string> =>
    runAction(async () => {
      if (amount <= 0) {
        throw new Error('Share amount must be greater than zero.')
      }
    const { program: liveProgram, wallet: liveWallet, provider: liveProvider } = ensureActionContext()
    const view = findView(propertyId)
    logEvent('buyShares:start', { propertyId, amount })
    const userUsdcAta = view.atas.userUsdcAta(liveWallet.publicKey)
    const userSharesAta = view.atas.userSharesAta(liveWallet.publicKey)
    const ataInstructions: TransactionInstruction[] = []
    if (!(await connection.getAccountInfo(userUsdcAta))) {
      ataInstructions.push(
        createAssociatedTokenAccountInstruction(
          liveProvider.wallet.publicKey,
          userUsdcAta,
          liveWallet.publicKey,
          view.usdcMint,
        ),
      )
    }
    if (!(await connection.getAccountInfo(userSharesAta))) {
      ataInstructions.push(
        createAssociatedTokenAccountInstruction(
          liveProvider.wallet.publicKey,
          userSharesAta,
          liveWallet.publicKey,
          view.addresses.mint,
        ),
      )
    }
    const signature = await liveProgram.methods
      .buyShares(new BN(amount))
      .accountsStrict({
        property: view.addresses.property,
        vault: view.addresses.vault,
        mint: view.addresses.mint,
        usdcMint: view.usdcMint,
        vaultSharesAta: view.atas.vaultSharesAta,
        vaultUsdcAta: view.atas.vaultUsdcAta,
        user: liveWallet.publicKey,
        userUsdcAta,
        userSharesAta,
        tokenProgram: SPL_PROGRAM_ID,
      })
      .preInstructions(ataInstructions)
      .rpc()
      logEvent('buyShares:complete', {
        propertyId,
        amount,
        signature,
        userSharesAta: userSharesAta.toBase58(),
        userUsdcAta: userUsdcAta.toBase58(),
      })
      return signature
    })

  const depositYield = async (propertyId: string, microUsdc: number): Promise<string> =>
    runAction(async () => {
      if (microUsdc <= 0) {
        throw new Error('Deposit amount must be positive.')
      }
      const { program: liveProgram, wallet: liveWallet, provider: liveProvider } = ensureActionContext()
      const view = findView(propertyId)
      if (!view.isAuthority) {
        throw new Error('Only the property authority can deposit yield.')
      }
      logEvent('depositYield:start', { propertyId, microUsdc })
      const authorityUsdcAta = await ensureAtaExists(connection, liveProvider, view.usdcMint, liveWallet.publicKey)
      const signature = await liveProgram.methods
        .depositYield(new BN(microUsdc))
        .accountsStrict({
          authority: liveWallet.publicKey,
          property: view.addresses.property,
          pool: view.addresses.pool,
          mint: view.addresses.mint,
          usdcMint: view.usdcMint,
          authorityUsdcAta,
          poolUsdcAta: view.atas.poolUsdcAta,
          tokenProgram: SPL_PROGRAM_ID,
        })
        .rpc()
      logEvent('depositYield:complete', { propertyId, microUsdc, signature, poolUsdcAta: view.atas.poolUsdcAta.toBase58() })
      return signature
    })

  const claim = async (propertyId: string): Promise<string> =>
    runAction(async () => {
      const { program: liveProgram, wallet: liveWallet, provider: liveProvider } = ensureActionContext()
      const view = findView(propertyId)
      if (view.userShares === 0n) {
        throw new Error('No shares available to claim rewards.')
      }
      logEvent('claim:start', { propertyId, pending: view.pendingRewards.toString() })
      const userSharesAta = await ensureAtaExists(connection, liveProvider, view.addresses.mint, liveWallet.publicKey)
      const userUsdcAta = await ensureAtaExists(connection, liveProvider, view.usdcMint, liveWallet.publicKey)
      const signature = await liveProgram.methods
        .claim()
        .accountsStrict({
          user: liveWallet.publicKey,
          property: view.addresses.property,
          pool: view.addresses.pool,
          userReward: deriveUserRewardAddress(view.addresses.pool, liveWallet.publicKey),
          userSharesAta,
          userUsdcAta,
          poolUsdcAta: view.atas.poolUsdcAta,
          mint: view.addresses.mint,
          usdcMint: view.usdcMint,
          tokenProgram: SPL_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      logEvent('claim:complete', {
        propertyId,
        signature,
        userSharesAta: userSharesAta.toBase58(),
        userUsdcAta: userUsdcAta.toBase58(),
      })
      return signature
    })

  return {
    properties,
    loading,
    error,
    buyShares,
    depositYield,
    claim,
    refresh,
  }
}
