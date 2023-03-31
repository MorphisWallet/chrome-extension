import cl from 'classnames'

import { Coin } from '_redux/slices/sui-objects/Coin'
import { coinMap } from '_src/ui/utils/coinMap'

type CoinIconProps = {
  type: string
  className?: string
} & React.DOMAttributes<HTMLDivElement>

export const CoinIcon = ({ type, className, ...rest }: CoinIconProps) => {
  const symbol = Coin.getCoinSymbol(type)

  return (
    <div
      className={cl([
        'flex items-center justify-center',
        'bg-[#c4c4c4] text-white rounded-full',
        className,
      ])}
      {...rest}
    >
      {coinMap[type]?.icon({ height: 34, width: 34 }) || symbol[0]}
    </div>
  )
}
