// CHANGE: Implemented a thin HouseApi client mirroring the KMP ktorfit definitions.
// WHY: React screens must call the same backend endpoints (`houses`, `user_houses`, `user/{id}`) that the Kotlin version relies on.
// QUOTE(TЗ): "Можешь глянуть текущую версию context.txt там были добавлены использование API Перенеси его 1 в 1"
// REF: user-message-4
// SOURCE: context.txt §core/data/src/commonMain/kotlin/com/yet/data/api/HouseApi.kt

import type { User } from '../models/types'

const BASE_URL = 'http://jumbo.galagen.net:2205/'

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

export interface UserResponse {
  readonly id?: number
  readonly wallet?: string
  readonly name?: string
  readonly surname?: string
}

type QueryParams = Record<string, string | number | undefined>

const buildUrl = (path: string, params?: QueryParams): string => {
  const url = new URL(path, BASE_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
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
  async getUser(userId: number): Promise<UserResponse> {
    return request<UserResponse>(`user/${userId}`)
  },
}

/**
 * KMP equivalent ensures we always have a valid domain user even if optional API fields are missing.
 * @param response Raw DTO from the House API.
 * @returns Sanitised user object.
 */
export const mapUserResponseToDomain = (response: UserResponse): User => {
  if (!response.id || !response.name || !response.surname) {
    throw new Error('HouseApi user response is missing required fields')
  }
  const wallet = response.wallet ?? ''
  return {
    id: String(response.id),
    name: `${response.name} ${response.surname}`.trim(),
    email: wallet,
    userRole: 'INVESTOR',
  }
}
