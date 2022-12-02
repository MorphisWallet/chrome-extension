import SendIcon from '_assets/icons/send.svg'
import ReceivedIcon from '_assets/icons/arrow_short.svg'

import type { TxResultState } from '_redux/slices/txresults'

enum StandardTxType {
  Call = 'Call',
  Sent = 'Sent',
  Received = 'Received',
}

type TxRenderType = {
  txName: string
  address: string | null
  transferrer: string | null
  Icon: React.ReactNode
  amount: number
}

export const toRenderProps = (tx: TxResultState): TxRenderType | null => {
  const amount = tx?.amount || tx?.balance || tx?.txGas || 0

  // TODO: support nft activities
  // if (tx.kind === 'Call') {
  //   return {
  //     txName: tx.name && tx.url ? 'Minted' : 'Call',
  //     transferrer: null,
  //     address: null,
  //     Icon: <SendIcon height={15} width={15} className="mr-0.5" />,
  //     amount: amount,
  //   }
  // }

  if (tx.isSender) {
    return {
      txName: StandardTxType.Sent,
      transferrer: 'To',
      address: tx.to || '',
      Icon: <SendIcon height={15} width={15} className="mr-0.5" />,
      amount: amount,
    }
  }

  if (tx.isSender === false) {
    return {
      txName: StandardTxType.Received,
      transferrer: 'From',
      address: tx.from || '',
      Icon: <ReceivedIcon height={15} width={15} className="rotate-[-90deg]" />,
      amount: amount,
    }
  }

  return null
}
