// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { TransactionBlock } from '@mysten/sui.js'
import { useCallback, useMemo } from 'react'

import { UserApproveContainer } from '_pages/dapp/components/user_approval_container'
import { GasFees } from './gas_fees'
import { TransactionDetails } from './transaction_details'

import { useAppDispatch, useSigner } from '_hooks'

import { respondToTransactionRequest } from '_redux/slices/transaction-requests'

import { type TransactionApprovalRequest } from '_payloads/transactions/ApprovalRequest'

export type TransactionRequestProps = {
  txRequest: TransactionApprovalRequest
}

export function TransactionRequest({ txRequest }: TransactionRequestProps) {
  const addressForTransaction = txRequest.tx.account
  const signer = useSigner(addressForTransaction)
  const dispatch = useAppDispatch()
  const transaction = useMemo(() => {
    const tx = TransactionBlock.from(txRequest.tx.data)
    if (addressForTransaction) {
      tx.setSenderIfNotSet(addressForTransaction)
    }
    return tx
  }, [txRequest.tx.data, addressForTransaction])

  const handleOnSubmit = useCallback(
    async (approved: boolean) => {
      await dispatch(
        respondToTransactionRequest({
          approved,
          txRequestID: txRequest.id,
          signer,
        })
      )
    },
    [dispatch, txRequest.id, signer]
  )

  return (
    <UserApproveContainer
      title="Approve Transaction"
      origin={txRequest.origin}
      originFavIcon={txRequest.originFavIcon}
      approveTitle="Approve"
      rejectTitle="Reject"
      onSubmit={handleOnSubmit}
      address={addressForTransaction}
    >
      <div className="flex flex-col py-4">
        <p>TRANSACTION SUMMARY</p>
      </div>
      <TransactionDetails
        sender={addressForTransaction}
        transaction={transaction}
      />
      <GasFees sender={addressForTransaction} transaction={transaction} />
    </UserApproveContainer>
  )
}
