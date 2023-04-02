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

export function GasFees({ sender, transaction }: Props) {
  const { data: transactionData } = useTransactionData(sender, transaction)
  const { data: gasBudget } = useTransactionGasBudget(sender, transaction)

  // const isSponsored =
  //   transactionData?.gasConfig.owner &&
  //   transactionData.sender !== transactionData.gasConfig.owner

  return (
    // <SummaryCard
    //   header="Estimated Gas Fees"
    //   badge={
    //     isSponsored ? (
    //       <div className="bg-white text-success px-1.5 py-0.5 text-captionSmallExtra rounded-full font-medium uppercase">
    //         Sponsored
    //       </div>
    //     ) : null
    //   }
    //   initialExpanded
    // >
    //   <DescriptionList>
    //     <DescriptionItem title="You Pay">
    //       {isSponsored ? 0 : gasBudget || '-'} {GAS_SYMBOL}
    //     </DescriptionItem>

    //     {isSponsored && (
    //       <>
    //         <DescriptionItem title="Sponsor Pays">
    //           {gasBudget || '-'} {GAS_SYMBOL}
    //         </DescriptionItem>
    //         <DescriptionItem title="Sponsor">
    //           {formatAddress(transactionData!.gasConfig.owner!)}
    //         </DescriptionItem>
    //       </>
    //     )}
    //   </DescriptionList>
    // </SummaryCard>
    <div className="flex justify-between items-center gap-4">
      <span className="text-[#818181]">Est. gas fees</span>
      <span className="truncate">
        {gasBudget || '-'} {GAS_SYMBOL}
      </span>
    </div>
  )
}
