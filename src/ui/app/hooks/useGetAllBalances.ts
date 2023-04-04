// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'

import { useRpcClient } from '_src/ui/core'

import { type SuiAddress } from '@mysten/sui.js'

export function useGetAllBalances(address?: SuiAddress | null) {
  const rpc = useRpcClient()
  return useQuery(
    ['get-all-balance', address],
    () => rpc.getAllBalances({ owner: address as string }),
    // refetchInterval is set to 4 seconds
    { enabled: !!address, refetchInterval: 4000 }
  )
}
