// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'

import { useRpcClient } from '_src/ui/core'

import type { SuiAddress, SuiObjectResponseQuery } from '@mysten/sui.js'

export function useObjectsOwnedByAddress(
  address?: SuiAddress | null,
  query?: SuiObjectResponseQuery
) {
  const rpc = useRpcClient()
  return useQuery(
    ['objects-owned', address, query],
    () =>
      rpc.getOwnedObjects({
        owner: address as string,
        filter: query?.filter,
        options: query?.options,
      }),
    {
      enabled: !!address,
    }
  )
}
