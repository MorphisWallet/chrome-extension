import { FormikProps } from 'formik'

import { Loading, Input, Button } from '_app/components'

import { useFormatCoin } from '_hooks'

import type { ConfirmFields } from '../utils'

type ConfirmStepOneProps = {
  loading: boolean
  coinBalance: bigint
  coinType: string
  formikProps: FormikProps<ConfirmFields>
}

export const StepOne = ({
  loading,
  coinBalance,
  coinType,
  formikProps,
}: ConfirmStepOneProps) => {
  const { values, errors, touched, handleChange, handleBlur } = formikProps

  const [formattedBalance, symbol] = useFormatCoin(coinBalance, coinType, true)

  return (
    <>
      <div className="flex justify-between mb-1">
        <span>Asset</span>
        <Loading loading={loading} className="w-8 grow-0">
          <span className="text-[#9c9d9e]">
            {formattedBalance} {symbol}
          </span>
        </Loading>
      </div>
      <div className="relative">
        <Input
          id="amount"
          name="amount"
          value={values.amount}
          placeholder="0.00"
          disabled={loading}
          onChange={(e) => {
            if (
              e.target.value !== '' &&
              !/^\d+((\.|,)\d{0,9})?$/g.test(e.target.value)
            ) {
              return
            }
            handleChange(e)
          }}
          onBlur={handleBlur}
          className="pb-4"
          inputClassName="rounded px-4 text-right"
          error={touched.amount && errors.amount}
        />
      </div>
      <div className="mb-1">Address</div>
      <Input
        id="address"
        name="address"
        value={values.address}
        placeholder="Address of SUI name"
        onChange={handleChange}
        onBlur={handleBlur}
        className="pb-4"
        inputClassName="rounded px-4"
        error={touched.address && errors.address}
      />
      <div className="grow" />
      <Button type="submit">Preview</Button>
    </>
  )
}
