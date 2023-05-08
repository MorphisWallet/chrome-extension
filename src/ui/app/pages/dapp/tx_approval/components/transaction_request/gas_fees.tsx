// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import {
  formatAddress,
  type SuiAddress,
  type TransactionBlock,
} from '@mysten/sui.js'

import { useTransactionData, useTransactionGasBudget } from '_src/ui/app/hooks'

import { GAS_SYMBOL } from '_src/ui/app/redux/slices/sui-objects/Coin'

interface Props {
  sender?: SuiAddress
  transaction: TransactionBlock
}

export const GasFees = ({ sender, transaction }: Props) => {
  const { data: transactionData } = useTransactionData(sender, transaction)
  const { data: gasBudget } = useTransactionGasBudget(sender, transaction)

  const isSponsored =
    transactionData?.gasConfig.owner &&
    transactionData.sender !== transactionData.gasConfig.owner

  return (
    <div className="flex flex-col mb-2">
      <p>ESTIMATED GAS FEES</p>
      <div className="flex justify-between items-center gap-4">
        <span className="text-[#818181]">You pay</span>
        <span className="truncate">
          {isSponsored ? 0 : gasBudget || '-'} {GAS_SYMBOL}
        </span>
      </div>
      {isSponsored && (
        <div>
          <div>Sponsor pays</div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[#818181]">
              {transactionData?.gasConfig?.owner
                ? formatAddress(transactionData?.gasConfig?.owner)
                : '-'}
            </span>
            <span className="truncate">
              {gasBudget || '-'} {GAS_SYMBOL}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
