// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'

import { useRpcClient } from '_src/ui/core'

import type { SuiAddress, PaginatedCoins, CoinStruct } from '@mysten/sui.js'

const MAX_COINS_PER_REQUEST = 100

// Fetch all coins for an address, this will keep calling the API until all coins are fetched
export function useGetCoins(coinType: string, address?: SuiAddress | null) {
  const rpc = useRpcClient()
  return useQuery(
    ['get-coins', address, coinType],
    async () => {
      let cursor: string | null = null
      const allData: CoinStruct[] = []
      // keep fetching until cursor is null or undefined
      do {
        const { data, nextCursor }: PaginatedCoins = await rpc.getCoins({
          owner: address as string,
          coinType,
          cursor,
          limit: MAX_COINS_PER_REQUEST,
        })
        if (!data || !data.length) {
          break
        }

        allData.push(...data)
        cursor = nextCursor
      } while (cursor)

      return allData
    },
    { enabled: !!address }
  )
}
