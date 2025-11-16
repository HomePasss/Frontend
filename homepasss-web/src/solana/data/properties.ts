// CHANGE: Fetch devnet property configuration from http://jumbo.galagen.net:2205/token to allow dynamic configuration.
// WHY: Properties must be loaded from the HTTP endpoint instead of being hardcoded to allow dynamic configuration as in init script.
// QUOTE(TЗ): "нам надо что бы он грузил инфу с http://jumbo.galagen.net:2205/token"
// REF: USER-HTTP-CONFIG
// SOURCE: /home/user/holding_contracts_solana_hackathon/scripts/init-properties.ts

// CHANGE: Remove fallback defaults so configs are sourced exclusively from the API.
// WHY: Requirement dictates that property data is fetched only from http://jumbo.galagen.net:2205/token without default overrides.
// QUOTE(TЗ): "Убери дефаулт конфиг Сделай что бы он всё тянул с апи только"
// REF: USER-API-ONLY
// SOURCE: /home/user/holding_contracts_solana_hackathon/scripts/init-properties.ts

import { fetchPropertyConfigs, type PropertyConfig } from './fetchProperties'

// Export interface and fetch function for dynamic loading
export type { PropertyConfig }

/**
 * Fetch property configurations from the API endpoint.
 *
 * Invariants:
 * - Returns only API-provided configurations; no bundled defaults.
 * - Rejects when the endpoint is unreachable or returns invalid payloads.
 *
 * @returns Promise resolving to an array of PropertyConfig objects
 */
export const loadPropertyConfigs = async (): Promise<readonly PropertyConfig[]> => {
  const configs = await fetchPropertyConfigs()
  return configs
}
