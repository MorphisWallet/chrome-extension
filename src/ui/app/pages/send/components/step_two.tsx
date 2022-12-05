import { FormikProps } from 'formik'
import BigNumber from 'bignumber.js'
import cl from 'classnames'

import { Button } from '_app/components'

import { useFormatCoin, useCoinDecimals, useMiddleEllipsis } from '_hooks'

import { coinMap } from '_app/utils/coin'
import { Coin, GAS_SYMBOL, GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin'
import { parseAmount } from '../utils'

import type { ConfirmFields } from '../utils'
import type { SuiMoveObject } from '@mysten/sui.js'

type ConfirmStepTwoProps = {
  coinBalance: bigint
  coinType: string
  formikProps: FormikProps<ConfirmFields>
  allCoinsOfSelectedTypeArg: SuiMoveObject[]
}

const SendStepTwo = ({
  coinBalance,
  coinType,
  formikProps,
  allCoinsOfSelectedTypeArg,
}: ConfirmStepTwoProps) => {
  const { values, isSubmitting } = formikProps
  const amount = parseAmount(values.amount.replace(',', '.'))
  const coinInfo = coinMap[coinType]

  const shortenAddress = useMiddleEllipsis(values.address, 10, 7)
  const [, symbol] = useFormatCoin(coinBalance, coinType, true)
  const [coinDecimals] = useCoinDecimals(coinType)

  const amountInUnit = amount.shiftedBy(coinDecimals).integerValue().toString()
  const gasBudget = Coin.computeGasBudgetForPay(
    allCoinsOfSelectedTypeArg,
    BigInt(amountInUnit)
  )
  const totalAmount = BigNumber(gasBudget)
    .plus(GAS_SYMBOL === symbol ? amountInUnit : 0)
    .toString()

  const [formattedTotal] = useFormatCoin(totalAmount, GAS_TYPE_ARG, true)
  const [formattedGas] = useFormatCoin(gasBudget, GAS_TYPE_ARG, true)

  return (
    <div className="flex flex-col grow items-center font-medium text-sm">
      <div
        className={cl([
          'h-[56px] w-[56px] mb-2',
          !coinInfo && 'bg-[#c4c4c4] text-white rounded-full',
        ])}
      >
        {coinInfo?.icon({ height: 56, width: 56 }) || symbol[0]}
      </div>
      <p className="mb-10 font-bold">{symbol}</p>
      <div className="flex justify-between w-full">
        <span className="text-[#9f9d9d]">Send to</span>
        <span title={values.address}>{shortenAddress}</span>
      </div>
      <hr className="border-t border-t-[#c4c4c4] my-4 w-full" />
      <div className="flex justify-between w-full mb-2">
        <span className="text-[#9f9d9d] shrink-0 mr-2">Total value</span>
        <span className="flex shrink truncate">
          <span title={formattedTotal} className="truncate">
            {formattedTotal || 0}
          </span>
          <span className="ml-1">{symbol}</span>
        </span>
      </div>
      <div className="flex justify-between w-full">
        <span className="text-[#9f9d9d] shrink-0 mr-2">Est. gas fee</span>
        <span className="flex shrink truncate">
          <span title={formattedGas} className="truncate">
            {formattedGas || 0}
          </span>
          <span className="ml-1">{GAS_SYMBOL}</span>
        </span>
      </div>
      <div className="grow" />
      <Button type="submit" loading={isSubmitting}>
        Confirm and Send
      </Button>
    </div>
  )
}

export default SendStepTwo
