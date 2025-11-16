// CHANGE: Fetch property configurations from http://jumbo.galagen.net:2205/token as in the initializer script.
// WHY: Properties must be loaded from the HTTP endpoint instead of being hardcoded to allow dynamic configuration.
// QUOTE(TЗ): "нам надо что бы он грузил инфу с http://jumbo.galagen.net:2205/token"
// REF: USER-HTTP-CONFIG
// SOURCE: /home/user/holding_contracts_solana_hackathon/scripts/init-properties.ts

export interface RemotePropertyConfig {
  propertyId: number | string;
  totalShares: number;
  metadataUri: string;
  tokenName: string;
  tokenSymbol: string;
  pricePerShare: number | string;
  usdcMint: string;
}

export interface PropertyConfig {
  readonly propertyId: string;
  readonly totalShares: number;
  readonly metadataUri: string;
  readonly tokenName: string;
  readonly tokenSymbol: string;
  readonly pricePerShare: number;
  readonly usdcMint: string;
}

const TOKEN_ENDPOINT = 'http://jumbo.galagen.net:2205/token';

/**
 * Parse pricePerShare value which could be a number, string with additional data, etc.
 * Supports formats like "66.5", "150.0JS:150", "42"
 */
// CHANGE: Constrain parser input to the remote contract type to avoid `unknown`/`any`.
// WHY: Global code safety rule forbids `any`/`unknown`; typed input preserves invariant with remote schema.
// QUOTE(TЗ): "Никогда не использовать `any`, `unknown`, `eslint-disable`, `ts-ignore`."
// REF: AGENTS.md
// SOURCE: n/a
function parsePricePerShare(value: RemotePropertyConfig['pricePerShare']): number {
  const text = String(value).trim();

  // Extract first numeric token
  const match = text.match(/(\d+(\.\d+)?)/);
  if (!match) {
    throw new Error(`pricePerShare has no numeric token: "${text}"`);
  }

  const num = parseFloat(match[1]);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(`pricePerShare is not a positive number: "${text}"`);
  }

  // Convert to the expected format (micro-USDC with 6 decimals, but we'll keep it as is for compatibility with existing code)
  return Math.round(num * 1000000);
}

/**
 * Fetch property configurations from the HTTP endpoint.
 * @returns Promise resolving to an array of PropertyConfig objects
 */
export async function fetchPropertyConfigs(): Promise<PropertyConfig[]> {
  try {
    const response = await fetch(TOKEN_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} when fetching ${TOKEN_ENDPOINT}`);
    }

    // CHANGE: Assert parsed JSON to the remote schema to avoid implicit `any`.
    // WHY: Enforces typed pipeline and keeps invariants aligned with backend contract.
    // QUOTE(TЗ): "Никогда не использовать `any`, `unknown`, `eslint-disable`, `ts-ignore`."
    // REF: AGENTS.md
    // SOURCE: n/a
    const rawData = (await response.json()) as RemotePropertyConfig[];
    
    if (!Array.isArray(rawData)) {
      throw new Error(`Unexpected response from ${TOKEN_ENDPOINT}: expected array`);
    }

    const configs: PropertyConfig[] = rawData.map((raw: RemotePropertyConfig, index: number) => {
      const propertyId = String(raw.propertyId);
      const totalShares = raw.totalShares;
      const metadataUri = raw.metadataUri;
      const tokenName = raw.tokenName;
      const tokenSymbol = raw.tokenSymbol;
      const usdcMint = raw.usdcMint;

      if (!propertyId || propertyId.length === 0) {
        throw new Error(`Entry #${index}: empty propertyId`);
      }
      if (!Number.isFinite(totalShares) || totalShares <= 0) {
        throw new Error(
          `Entry #${index} (${propertyId}): invalid totalShares=${totalShares}`,
        );
      }

      const pricePerShare = parsePricePerShare(raw.pricePerShare);

      return {
        propertyId,
        totalShares,
        metadataUri,
        tokenName,
        tokenSymbol,
        pricePerShare,
        usdcMint,
      };
    });

    return configs;
  } catch (error) {
    console.error('Error fetching property configurations:', error);
    throw error;
  }
}
