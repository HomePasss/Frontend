// CHANGE: Centralized Solana constants (program id, seeds, decimals) copied from the on-chain project.
// WHY: PDA derivation and Anchor client setup must match the deployed program or minting fails.
// QUOTE(TЗ): "Надо сделать что бы мы всё минтили"
// REF: user-message-61
// SOURCE: /home/user/holding_contracts_solana_hackathon/app/src/lib/constants.ts

import { PublicKey } from '@solana/web3.js'

/** Devnet endpoint aligned with Anchor.toml to avoid cluster mismatches. */
export const DEVNET_ENDPOINT = 'https://api.devnet.solana.com'

/** Address of the deployed property_shares program. */
export const PROGRAM_ID = new PublicKey('Bvq9mwXmV95Mz848zK8FZ11JiKfLjGc7savK5u657H9Z')

export const PROPERTY_SEED = 'property'
export const VAULT_SEED = 'vault'
export const POOL_SEED = 'pool'
export const MINT_SEED = 'property_mint'
export const USER_REWARD_SEED = 'user_reward'

/** SCALE constant reproduced from programs/property_shares/src/contract/constants.rs */
export const ACC_SCALE = 1_000_000_000_000n

/** SPL decimals used for the mocked devnet USDC mint. */
export const USDC_DECIMALS = 6n
