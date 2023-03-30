// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useQuery } from '@tanstack/react-query'

import { useRpcClient } from '_src/ui/core'

export function useReferenceGasPrice() {
  const rpc = useRpcClient()
  // TODO: when epoch changes we should clear cache for this
  return useQuery(['getReferenceGasPrice'], () => rpc.getReferenceGasPrice())
}
