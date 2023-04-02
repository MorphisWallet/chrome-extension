// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Loading } from '_src/ui/app/components'

import { useTransactionData } from '_src/ui/app/hooks'

import { type SuiAddress, type TransactionBlock } from '@mysten/sui.js'

interface Props {
  sender?: SuiAddress
  transaction: TransactionBlock
}

export function TransactionDetails({ sender, transaction }: Props) {
  const { data: transactionData } = useTransactionData(sender, transaction)

  if (
    transactionData?.transactions.length === 0 &&
    transactionData.inputs.length === 0
  ) {
    return null
  }

  return (
    <div className="py-4">
      <Loading loading={!transactionData}>
        {transactionData && (
          <div className="flex flex-col">
            {!!transactionData.transactions.length && (
              <div>
                <p className="text-bold">Transactions</p>
                <div>
                  {transactionData.transactions.map((command, index) => (
                    <div key={index}></div>
                  ))}
                </div>
              </div>
            )}
            {!!transactionData.inputs.length && (
              <div>
                <p className="text-bold">Inputs</p>
              </div>
            )}
          </div>
        )}
      </Loading>
    </div>
  )
}
