import cl from 'classnames'

import { useCoinMetadata } from '_src/ui/core'

import COINS from './coins.json'
import { coinMap } from '_src/ui/utils/coinMap'

import type { CoinData } from './coin'

type CoinIconProps = {
  type: string
  className?: string
  iconSize?: number
} & React.DOMAttributes<HTMLDivElement>

export const CoinIcon = ({
  type,
  className,
  iconSize = 34,
  ...rest
}: CoinIconProps) => {
  const { data: coinMetadata } = useCoinMetadata(type)

  const renderCoinIcon = () => {
    if (coinMetadata?.iconUrl) {
      return (
        <img
          className="rounded-full object-cover overflow-hidden"
          src={coinMetadata.iconUrl}
          alt={coinMetadata.name}
          style={{ height: `${iconSize}px`, width: `${iconSize}px` }}
        />
      )
    }

    const _coin = (COINS as CoinData[]).find((_c) => _c.coin_type === type)
    if (_coin?.icon_url) {
      return (
        <img
          className="h-[34px] w-[34px] rounded-full object-cover overflow-hidden"
          src={_coin.icon_url}
          alt={_coin.name}
          style={{ height: `${iconSize}px`, width: `${iconSize}px` }}
        />
      )
    }

    return (
      coinMap[coinMetadata?.symbol || '']?.icon({
        height: iconSize ?? 34,
        width: iconSize ?? 34,
      }) ||
      coinMetadata?.name?.[0] ||
      '-'
    )
  }

  return (
    <div
      className={cl([
        'flex items-center justify-center',
        'bg-[#c4c4c4] text-white rounded-full',
        className,
      ])}
      {...rest}
    >
      {renderCoinIcon()}
    </div>
  )
}
