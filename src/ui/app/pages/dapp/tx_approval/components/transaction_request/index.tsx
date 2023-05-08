// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from 'react'
import cl from 'classnames'
import { Disclosure } from '@headlessui/react'
import { TransactionBlock } from '@mysten/sui.js'

import { UserApproveContainer } from '_pages/dapp/components/user_approval_container'
import { GasFees } from './gas_fees'
import { TransactionDetails } from './transaction_details'
import { TransactionSummary } from './transaction_summary'

import { useAppDispatch, useSigner } from '_hooks'

import { respondToTransactionRequest } from '_redux/slices/transaction-requests'

import ChevronRight from '_assets/icons/chevron_right.svg'

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
      <TransactionSummary
        transaction={transaction}
        address={addressForTransaction}
      />
      <GasFees sender={addressForTransaction} transaction={transaction} />
      <div>
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between mb-2 text-left text-sm font-medium rounded-lg transition-colors hover:text-gray-500">
                <p className="grow flex justify-between items-center text-black">
                  <span>Details</span>
                  <ChevronRight
                    className={cl([open ? '-rotate-90' : 'rotate-90'])}
                    height={12}
                    width={12}
                  />
                </p>
              </Disclosure.Button>
              <Disclosure.Panel className="text-sm text-gray-500">
                <TransactionDetails
                  sender={addressForTransaction}
                  transaction={transaction}
                />
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </UserApproveContainer>
  )
}
