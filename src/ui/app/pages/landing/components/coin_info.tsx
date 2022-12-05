import { CoinIcon } from '_app/components'

import { useFormatCoin } from '_hooks'

import { coinMap, CoinInfo as CoinInfoType } from '_app/utils/coin'

type CoinInfoProps = {
  balance: bigint | number
  type: string
} & React.DOMAttributes<HTMLDivElement>

const CoinInfo = ({ balance, type, ...rest }: CoinInfoProps) => {
  const [formatted, symbol] = useFormatCoin(balance, type, true)

  const coinInfo: CoinInfoType | undefined = coinMap[type]

  return (
    <div
      className="flex items-center py-4 px-8 text-sm transition:colors duration-300 hover:bg-[#f5f5f5]"
      {...rest}
    >
      <CoinIcon type={type} className="h-[34px] w-[34px] mr-3" />
      <div className="flex flex-col grow">
        <span className="font-bold">{coinInfo?.name || symbol}</span>
        <span className="font-normal text-[#818181]">{symbol}</span>
      </div>
      <div>{formatted}</div>
    </div>
  )
}

export default CoinInfo