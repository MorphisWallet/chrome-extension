import { useMemo } from 'react'
import {
  getExecutionStatusError,
  getExecutionStatusType,
  getTransactionDigest,
  getTransactionKind,
  getTransactionSender,
  SUI_TYPE_ARG,
} from '@mysten/sui.js'

import { useGetTransferAmount, useGetTxnRecipientAddress } from '_hooks'

import { TxLink, toast } from '_app/components'

import { useFormatCoin } from '_src/ui/core'

import { GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin'

import SendIcon from '_assets/icons/send.svg'
import ReceivedIcon from '_assets/icons/arrow_short.svg'

import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'
import type {
  SuiAddress,
  SuiTransactionBlockResponse,
  SuiTransactionBlockKind,
} from '@mysten/sui.js'

type TxProps = {
  txn: SuiTransactionBlockResponse
  address: SuiAddress
}

const Tx = ({ txn, address }: TxProps) => {
  const transaction = getTransactionKind(txn) as SuiTransactionBlockKind
  const executionStatus = getExecutionStatusType(txn)

  const transfer = useGetTransferAmount({
    txn,
    activeAddress: address,
  })

  // we only show Sui Transfer amount or the first non-Sui transfer amount
  const transferAmount = useMemo(() => {
    // Find SUI transfer amount
    const amountTransfersSui = transfer?.find(
      ({ coinType }) => coinType === SUI_TYPE_ARG
    )

    // Find non-SUI transfer amount
    const amountTransfersNonSui = transfer?.find(
      ({ coinType }) => coinType !== SUI_TYPE_ARG
    )

    return {
      amount:
        amountTransfersSui?.amount || amountTransfersNonSui?.amount || null,
      coinType:
        amountTransfersSui?.coinType || amountTransfersNonSui?.coinType || null,
    }
  }, [transfer])

  const recipientAddress = useGetTxnRecipientAddress({ txn, address })

  const isSender = address === getTransactionSender(txn)

  const error = getExecutionStatusError(txn)

  return (
    <TxLink
      type={ExplorerLinkType.transaction}
      transactionID={getTransactionDigest(txn)}
      className="flex items-center shrink-0 h-[52px] py-3 border-b border-b-[#c4c4c4]"
    >
      <div className="flex justify-center items-center shrink-0 h-6 w-6 mr-4 bg-black text-white rounded-full">
        {isSender ? (
          <SendIcon height={15} width={15} className="mr-0.5" />
        ) : (
          <ReceivedIcon height={15} width={15} className="rotate-[-90deg]" />
        )}
      </div>
      <div className="flex flex-col grow">
        <span className="text-[13px]">
          <span className="text-[#6bb7e9]">
            ({transferAmount.amount} {transferAmount.coinType})
          </span>
        </span>
        <div className="flex justify-between">
          <span title={address || ''} className="text-[11px] text-[#c4c4c4]">
            {`${isSender ? 'To' : 'From'} ${
              recipientAddress || '- View on explorer'
            }`}
          </span>
          <span className="text-[10px] text-[#c4c4c4]">
            {txn.timestampMs
              ? new Date(txn.timestampMs).toLocaleTimeString('en-US')
              : '-'}
          </span>
        </div>
      </div>
    </TxLink>
  )
}

export default Tx
