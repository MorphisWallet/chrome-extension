// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type MouseEventHandler, useCallback } from 'react'

import { toast } from '_app/components'

export type CopyOptions = {
  copySuccessMessage?: string
}

export function useCopyToClipboard(
  textToCopy: string,
  { copySuccessMessage = 'Copied' }: CopyOptions = {}
) {
  return useCallback<MouseEventHandler>(
    async (e) => {
      e.stopPropagation()
      e.preventDefault()
      try {
        await navigator.clipboard.writeText(textToCopy)
        toast({
          type: 'success',
          message: copySuccessMessage,
        })
      } catch (e) {
        // silence clipboard errors
      }
    },
    [textToCopy, copySuccessMessage]
  )
}
