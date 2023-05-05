import cl from 'classnames'

import { useCoinMetadata } from '_src/ui/core'

import { coinMap } from '_src/ui/utils/coinMap'

type CoinIconProps = {
  type: string
  className?: string
  iconSize?: number
} & React.DOMAttributes<HTMLDivElement>

export const CoinIcon = ({
  type,
  className,
  iconSize,
  ...rest
}: CoinIconProps) => {
  const { data: coinMetadata } = useCoinMetadata(type)

  return (
    <div
      className={cl([
        'flex items-center justify-center',
        'bg-[#c4c4c4] text-white rounded-full',
        className,
      ])}
      {...rest}
    >
      {coinMap[type]?.icon({ height: iconSize ?? 34, width: iconSize ?? 34 }) ||
        coinMetadata?.name?.[0] ||
        '-'}
    </div>
  )
}
