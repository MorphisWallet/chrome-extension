import { Link } from 'react-router-dom'
import cl from 'classnames'

import { useFormatCoin } from '_hooks'

import { coinMap, CoinInfo as CoinInfoType } from '_app/utils/coin'

type CoinInfoProps = {
  balance: bigint | number
  type: string
}

export const CoinInfo = ({ balance, type }: CoinInfoProps) => {
  const [formatted, symbol] = useFormatCoin(balance, type, true)

  const coinInfo: CoinInfoType | undefined = coinMap[type]

  return (
    <Link
      to={`./details?type=${type}`}
      className="flex items-center py-4 px-8 text-sm transition:colors duration-300 hover:bg-[#f5f5f5]"
    >
      <div
        className={cl([
          'h-[34px] w-[34px] mr-3 flex items-center justify-center',
          !coinInfo && 'bg-[#c4c4c4] text-white rounded-full',
        ])}
      >
        {coinInfo?.icon({ height: 34, width: 34 }) || symbol[0]}
      </div>
      <div className="flex flex-col grow">
        <span className="font-bold">{coinInfo?.name || symbol}</span>
        <span className="font-normal text-[#818181]">{symbol}</span>
      </div>
      <div>{formatted}</div>
    </Link>
  )
}
