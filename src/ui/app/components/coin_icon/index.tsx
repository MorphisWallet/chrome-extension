import cl from 'classnames'

import { Coin } from '_redux/slices/sui-objects/Coin'
import { coinMap } from '_app/utils/coin'

type CoinIconProps = {
  type: string
  className?: string
} & React.DOMAttributes<HTMLDivElement>

export const CoinIcon = ({ type, className, ...rest }: CoinIconProps) => {
  const symbol = Coin.getCoinSymbol(type)
  const coinInfo = coinMap[type]

  return (
    <div
      className={cl([
        'flex items-center justify-center',
        !coinInfo && 'bg-[#c4c4c4] text-white rounded-full',
        className,
      ])}
      {...rest}
    >
      {coinInfo?.icon({ height: '100%', width: '100%' }) || symbol[0]}
    </div>
  )
}
