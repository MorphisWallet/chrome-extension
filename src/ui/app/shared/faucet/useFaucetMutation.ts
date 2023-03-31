// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useIsMutating, useMutation } from '@tanstack/react-query'

import { useRpcClient } from '_src/ui/core'
import { useActiveAddress } from '../../hooks/useActiveAddress'

export function useFaucetMutation() {
  const api = useRpcClient()
  const address = useActiveAddress()
  const mutationKey = ['faucet-request-tokens', address]
  const mutation = useMutation({
    mutationKey,
    mutationFn: async () => {
      if (!address) {
        throw new Error('Failed, wallet address not found.')
      }
      try {
        const { error, transferredGasObjects } = await api.requestSuiFromFaucet(
          address
        )
        if (error) {
          throw new Error('Sui server error - ' + error)
        }
        return transferredGasObjects.reduce(
          (total, { amount }) => total + amount,
          0
        )
      } catch (err) {
        throw new Error('Sui server error - ' + (err as Error)?.message || '')
      }
    },
  })
  return {
    ...mutation,
    /** If the currently-configured endpoint supports faucet: */
    enabled: !!api.connection.faucet,
    /**
     * is any faucet request in progress across different instances of the mutation
     */
    isMutating: useIsMutating({ mutationKey }) > 0,
  }
}
