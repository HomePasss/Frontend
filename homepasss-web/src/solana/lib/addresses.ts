// CHANGE: Provide PDA/ATA derivation helpers mirroring the on-chain seeds.
// WHY: Frontend actions (buy/deposit/claim) must target the exact accounts derived by the Anchor program.
// QUOTE(TЗ): "Надо сделать что бы мы всё минтили"
// REF: user-message-61
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/lib/addresses.ts

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { MINT_SEED, POOL_SEED, PROGRAM_ID, PROPERTY_SEED, USER_REWARD_SEED, VAULT_SEED } from './constants'

export interface DerivedAddresses {
  readonly property: PublicKey
  readonly vault: PublicKey
  readonly pool: PublicKey
  readonly mint: PublicKey
}

/** Deterministically derive the PDAs for a property definition. */
export const deriveCoreAddresses = (propertyId: string): DerivedAddresses => {
  const property = PublicKey.findProgramAddressSync(
    [Buffer.from(PROPERTY_SEED), Buffer.from(propertyId)],
    PROGRAM_ID,
  )[0]

  const vault = PublicKey.findProgramAddressSync([Buffer.from(VAULT_SEED), property.toBuffer()], PROGRAM_ID)[0]

  const pool = PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED), property.toBuffer()], PROGRAM_ID)[0]

  const mint = PublicKey.findProgramAddressSync([Buffer.from(MINT_SEED), property.toBuffer()], PROGRAM_ID)[0]

  return { property, vault, pool, mint }
}

export interface AtaBundle {
  readonly vaultSharesAta: PublicKey
  readonly vaultUsdcAta: PublicKey
  readonly poolUsdcAta: PublicKey
  readonly userSharesAta: (owner: PublicKey) => PublicKey
  readonly userUsdcAta: (owner: PublicKey) => PublicKey
}

/** Build ATA helpers for later submission inside Anchor instructions. */
export const makeAtaBundle = (mint: PublicKey, usdcMint: PublicKey, vault: PublicKey, pool: PublicKey): AtaBundle => ({
  vaultSharesAta: getAssociatedTokenAddressSync(mint, vault, true),
  vaultUsdcAta: getAssociatedTokenAddressSync(usdcMint, vault, true),
  poolUsdcAta: getAssociatedTokenAddressSync(usdcMint, pool, true),
  userSharesAta: (owner: PublicKey) => getAssociatedTokenAddressSync(mint, owner),
  userUsdcAta: (owner: PublicKey) => getAssociatedTokenAddressSync(usdcMint, owner),
})

/** Compute the PDA for the user_reward account used during claims. */
export const deriveUserRewardAddress = (pool: PublicKey, user: PublicKey): PublicKey =>
  PublicKey.findProgramAddressSync(
    [Buffer.from(USER_REWARD_SEED), pool.toBuffer(), user.toBuffer()],
    PROGRAM_ID,
  )[0]

export const SPL_PROGRAM_ID = TOKEN_PROGRAM_ID
export const ATA_PROGRAM_ID = ASSOCIATED_TOKEN_PROGRAM_ID
