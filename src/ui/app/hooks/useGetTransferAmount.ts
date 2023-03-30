// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SUI_TYPE_ARG, getTransactionKind } from '@mysten/sui.js'
import { useMemo } from 'react'

import { getAmount } from '_helpers'

import type {
  SuiTransactionBlockKind,
  TransactionEffects,
  TransactionEvents,
  SuiTransactionBlockResponse,
  SuiAddress,
} from '@mysten/sui.js'

export function useGetTransferAmount({
  txn,
  activeAddress,
}: {
  txn: SuiTransactionBlockResponse
  activeAddress: SuiAddress
}) {
  const { effects, events } = txn
  // const { coins } = getEventsSummary(events!, activeAddress);

  const suiTransfer = useMemo(() => {
    const txdetails = getTransactionKind(txn)
    return getAmount(
      txdetails as SuiTransactionBlockKind,
      effects as TransactionEffects,
      events as TransactionEvents
    )?.map(({ amount, coinType, recipientAddress }) => {
      return {
        amount: amount || 0,
        coinType: coinType || SUI_TYPE_ARG,
        receiverAddress: recipientAddress,
      }
    })
  }, [txn, effects, events])

  // MUSTFIX(chris)
  // const transferAmount = useMemo(() => {
  //     return suiTransfer?.length
  //         ? suiTransfer
  //         : coins.filter(
  //               ({ receiverAddress }) => receiverAddress === activeAddress
  //           );
  // }, [suiTransfer, coins, activeAddress]);

  // return suiTransfer ?? transferAmount;
  return suiTransfer
}
