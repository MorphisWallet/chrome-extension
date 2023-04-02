// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import { fromB64 } from '@mysten/sui.js'

import { UserApproveContainer } from '_pages/dapp/components/user_approval_container'

import { useAppDispatch, useSigner } from '_hooks'

import { respondToTransactionRequest } from '_src/ui/app/redux/slices/transaction-requests'

import type { SignMessageApprovalRequest } from '_payloads/transactions/ApprovalRequest'

export type SignMessageRequestProps = {
  request: SignMessageApprovalRequest
}

export function SignMessageRequest({ request }: SignMessageRequestProps) {
  const { message, type } = useMemo(() => {
    const messageBytes = fromB64(request.tx.message)
    let message: string = request.tx.message
    let type: 'utf8' | 'base64' = 'base64'
    try {
      message = new TextDecoder('utf8', { fatal: true }).decode(messageBytes)
      type = 'utf8'
    } catch (e) {
      // do nothing
    }
    return {
      message,
      type,
    }
  }, [request.tx.message])

  const signer = useSigner(request.tx.accountAddress)
  const dispatch = useAppDispatch()

  return (
    <UserApproveContainer
      title="Sign Message"
      origin={request.origin}
      originFavIcon={request.originFavIcon}
      approveTitle="Sign"
      rejectTitle="Reject"
      onSubmit={async (approved) => {
        await dispatch(
          respondToTransactionRequest({
            txRequestID: request.id,
            approved,
            signer,
          })
        )
      }}
    >
      <div className="flex flex-col gap-4">
        <p className="font-bold text-xl">Message You Are Signing</p>
        <p className="">{message}</p>
      </div>
    </UserApproveContainer>
  )
}
