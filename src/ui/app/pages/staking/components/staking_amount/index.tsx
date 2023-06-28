import { SUI_TYPE_ARG } from '@mysten/sui.js'

import { useFormatCoin } from '_src/ui/core'

type StakingAmountProps = {
  balance: bigint | number | string
  formatClassName?: string
  symbolClassName?: string
}

const StakingAmount = ({
  balance,
  formatClassName,
  symbolClassName,
}: StakingAmountProps) => {
  const [formatted, symbol] = useFormatCoin(balance, SUI_TYPE_ARG)

  return (
    <span>
      <span className={formatClassName}>{formatted}</span>
      &nbsp;
      <span className={symbolClassName}>{symbol}</span>
    </span>
  )
}

export default StakingAmount
