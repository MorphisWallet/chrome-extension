// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useMutation } from '@tanstack/react-query'

import { useBackgroundClient } from './useBackgroundClient'

import { toast } from '_app/components'

export function useDeriveNextAccountMutation() {
  const backgroundClient = useBackgroundClient()
  return useMutation({
    mutationFn: () => {
      return backgroundClient.deriveNextAccount()
    },
    onSuccess: () => {
      toast({
        type: 'success',
        message: 'New account created',
      })
    },
    onError: (e) => {
      toast({
        type: 'error',
        message: (e as Error).message || 'Failed to create new account',
      })
    },
  })
}
