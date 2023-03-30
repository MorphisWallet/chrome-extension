// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useRpcClient } from '@mysten/core'
import { type SuiAddress } from '@mysten/sui.js'
import { useQuery } from '@tanstack/react-query'

export function useGetCoinBalance(
  coinType: string,
  address?: SuiAddress | null
) {
  const rpc = useRpcClient()
  return useQuery(
    ['coin-balance', address, coinType],
    () => rpc.getBalance({ owner: address!, coinType }),
    {
      enabled: !!address && !!coinType,
      refetchInterval: 4000,
    }
  )
}
