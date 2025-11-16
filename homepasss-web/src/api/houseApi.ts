// CHANGE: Implemented a thin HouseApi client mirroring the KMP ktorfit definitions.
// WHY: React screens must call the same backend endpoints (`houses`, `user_houses`, `user/{id}`) that the Kotlin version relies on.
// REF: user-message-4
// SOURCE: context.txt §core/data/src/commonMain/kotlin/com/yet/data/api/HouseApi.kt

const REMOTE_BASE = 'http://jumbo.galagen.net:2205'
const LOCAL_BASE = '/house-api'
const BASE_URL =
  (import.meta.env.VITE_HOUSE_API_BASE as string | undefined) ??
  (import.meta.env.DEV ? LOCAL_BASE : REMOTE_BASE)

export interface HouseDTO {
  readonly id: number
  readonly name: string
  readonly address: string
  readonly area?: number
  readonly images: readonly string[]
  readonly cost?: number
  readonly tokens?: number
  readonly type?: string
}

type QueryParams = Record<string, string | number | undefined>

const buildUrl = (path: string, params?: QueryParams): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const search = params
    ? `?${new URLSearchParams(
        Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value)
          }
          return acc
        }, {}),
      ).toString()}`
    : ''

  return `${BASE_URL}${normalizedPath}${search}`
}

const request = async <T>(path: string, params?: QueryParams): Promise<T> => {
  const response = await fetch(buildUrl(path, params))
  if (!response.ok) {
    throw new Error(`HouseApi request failed: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as T
}

export const houseApi = {
  async getHouses(count = 10): Promise<HouseDTO[]> {
    return request<HouseDTO[]>('houses', { n: count })
  },
  async getUserHouses(userId: number, count = 10): Promise<HouseDTO[]> {
    return request<HouseDTO[]>('user_houses', { user_id: userId, n: count })
  },
}
