import { TxLink } from '_app/components'

import { useFormatCoin, useMiddleEllipsis } from '_hooks'

import { GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin'
import { toRenderProps } from '../utils'

import { ExplorerLinkType } from '_app/components/tx_link/type'
import type { TxResultState } from '_redux/slices/txresults'

const Tx = (tx: TxResultState) => {
  const renderProps = toRenderProps(tx)

  if (!renderProps) return null

  const { txName, transferrer, address, Icon, amount } = renderProps

  const [formatted, symbol] = useFormatCoin(
    amount,
    tx.coinType || GAS_TYPE_ARG,
    true
  )
  const truncatedAddress = useMiddleEllipsis(address, 10, 7)

  return (
    <TxLink
      type={ExplorerLinkType.transaction}
      transactionID={tx.txId}
      className="flex items-center shrink-0 h-[52px] py-3 border-b border-b-[#c4c4c4]"
    >
      <div className="flex justify-center items-center shrink-0 h-6 w-6 mr-4 bg-black text-white rounded-full">
        {Icon}
      </div>
      <div className="flex flex-col grow">
        <span className="text-[13px]">
          {txName}{' '}
          {transferrer && (
            <span className="text-[#6bb7e9]">
              ({formatted} {symbol})
            </span>
          )}
        </span>
        <div className="flex justify-between">
          <span title={address || ''} className="text-[11px] text-[#c4c4c4]">
            {transferrer} {truncatedAddress || '- View on explorer'}
          </span>
          <span className="text-[10px] text-[#c4c4c4]">
            {tx.timestampMs &&
              new Date(tx.timestampMs).toLocaleTimeString('en-US')}
          </span>
        </div>
      </div>
    </TxLink>
  )
}

export default Tx
