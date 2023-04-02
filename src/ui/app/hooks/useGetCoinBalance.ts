// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type SuiAddress } from '@mysten/sui.js'
import { useQuery } from '@tanstack/react-query'

import { useRpcClient } from '_src/ui/core'

export function useGetCoinBalance(
  coinType: string,
  address?: SuiAddress | null
) {
  const rpc = useRpcClient()
  return useQuery(
    ['coin-balance', address, coinType],
    () => rpc.getBalance({ owner: address as string, coinType }),
    {
      enabled: !!address && !!coinType,
      refetchInterval: 4000,
    }
  )
}
