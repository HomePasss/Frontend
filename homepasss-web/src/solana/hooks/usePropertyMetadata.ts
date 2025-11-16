// CHANGE: Added a metadata hook so profile tokens can display Solana-provided titles/locations instead of static text.
// WHY: "My objects" must render on-chain token info (REQ-3) and cannot rely on hardcoded Moscow cards.
// QUOTE(TЗ): "MyOBjects это токены. Мы ничего не хардкодим"
// REF: REQ-3
// SOURCE: n/a

import { useEffect, useRef, useState } from 'react'

export interface PropertyMetadataAttribute {
  readonly trait_type?: string
  readonly value?: string
}

export interface PropertyMetadata {
  readonly name?: string
  readonly description?: string
  readonly image?: string
  readonly attributes?: readonly PropertyMetadataAttribute[]
}

export type PropertyMetadataMap = Record<string, PropertyMetadata>

interface MetadataSource {
  readonly config: {
    readonly propertyId: string
    readonly metadataUri?: string
  }
}

/**
 * Fetches devnet metadata JSON files tied to each Solana property mint.
 * @param properties Property views returned by {@link usePropertyShares}.
 * @returns Map keyed by propertyId with raw metadata payloads.
 */
export const usePropertyMetadata = (properties: readonly MetadataSource[]): PropertyMetadataMap => {
  const [metadata, setMetadata] = useState<PropertyMetadataMap>({})
  const fetchedRef = useRef(new Map<string, string>())

  useEffect(() => {
    let cancelled = false
    const pending = properties.filter((view) => {
      const key = view.config.propertyId
      const uri = view.config.metadataUri ?? ''
      const alreadyFetched = fetchedRef.current.get(key)
      return uri.length > 0 && alreadyFetched !== uri
    })
    if (pending.length === 0) {
      return
    }

    const fetchMetadata = async () => {
      const entries = await Promise.all(
        pending.map(async (view) => {
          const { propertyId, metadataUri } = view.config
          if (!metadataUri) {
            return null
          }
          try {
            const response = await fetch(metadataUri)
            if (!response.ok) {
              throw new Error(`Metadata request failed with ${response.status}`)
            }
            const json = (await response.json()) as PropertyMetadata
            fetchedRef.current.set(propertyId, metadataUri)
            return [propertyId, json] as const
          } catch (error) {
            console.error('[PropertyMetadata] Failed to load metadata', { propertyId, error })
            return null
          }
        }),
      )
      if (cancelled) {
        return
      }
      const validEntries = entries.filter((entry): entry is readonly [string, PropertyMetadata] => Boolean(entry))
      if (validEntries.length > 0) {
        setMetadata((prev) => ({ ...prev, ...Object.fromEntries(validEntries) }))
      }
    }

    void fetchMetadata()
    return () => {
      cancelled = true
    }
  }, [properties])

  return metadata
}
