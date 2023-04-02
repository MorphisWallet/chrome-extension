// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { Loading } from '_src/ui/app/components'
import { SignMessageRequest } from './components/sign_message_request'
import { TransactionRequest } from './components/transaction_request'

import { useAppSelector } from '_src/ui/app/hooks'
import {
  isSignMessageApprovalRequest,
  isTransactionApprovalRequest,
} from '_payloads/transactions/ApprovalRequest'
import { txRequestsSelectors } from '_src/ui/app/redux/slices/transaction-requests'

import type { RootState } from '_src/ui/app/redux/RootReducer'

export function ApprovalRequestPage() {
  const { requestID } = useParams()
  const requestSelector = useMemo(
    () => (state: RootState) =>
      (requestID && txRequestsSelectors.selectById(state, requestID)) || null,
    [requestID]
  )
  const request = useAppSelector(requestSelector)
  const requestsLoading = useAppSelector(
    ({ transactionRequests }) => !transactionRequests.initialized
  )

  useEffect(() => {
    if (
      !requestsLoading &&
      (!request || (request && request.approved !== null))
    ) {
      window.close()
    }
  }, [requestsLoading, request])

  return (
    <Loading loading={requestsLoading}>
      {request ? (
        isSignMessageApprovalRequest(request) ? (
          <SignMessageRequest request={request} />
        ) : isTransactionApprovalRequest(request) ? (
          <TransactionRequest txRequest={request} />
        ) : null
      ) : null}
    </Loading>
  )
}
