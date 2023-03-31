import { CoinIcon } from '_app/components'

import { useFormatCoin } from '_src/ui/core'

import type { CoinBalance } from '@mysten/sui.js'

type CoinInfoProps = {
  balance: CoinBalance
} & React.DOMAttributes<HTMLDivElement>

const CoinInfo = ({ balance, ...rest }: CoinInfoProps) => {
  const [formatted, symbol] = useFormatCoin(
    balance.totalBalance,
    balance.coinType
  )

  return (
    <div
      className="flex items-center py-4 px-8 text-sm transition:colors duration-300 hover:bg-[#f5f5f5]"
      {...rest}
    >
      <CoinIcon type={balance.coinType} className="h-[34px] w-[34px] mr-3" />
      <div className="flex flex-col grow">
        <span className="font-bold">{balance.coinType}</span>
        <span className="font-normal text-[#818181]">{symbol}</span>
      </div>
      <div>{formatted}</div>
    </div>
  )
}

export default CoinInfo
