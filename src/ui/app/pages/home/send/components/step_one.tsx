import { FormikProps } from 'formik'
import { useState } from 'react'

import { Loading, Input, Button, CoinIcon } from '_app/components'
import { SelectCoinModal } from './select_coin_modal'

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

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <SelectCoinModal
        open={modalOpen}
        setOpen={setModalOpen}
      />
      <div className="flex justify-between mb-1">
        <span>Asset</span>
        <Loading loading={loading} className="w-8 grow-0">
          <span className="text-[#9c9d9e]">
            {formattedBalance} {symbol}
          </span>
        </Loading>
      </div>
      <div className="relative">
        <CoinIcon
          type={coinType}
          className="absolute h-6 w-6 top-[9px] left-4 mr-2 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
          onClick={() => setModalOpen(true)}
        />
        <span className="absolute text-sm top-3 left-12">{symbol}</span>
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
          inputClassName="rounded px-4 pl-24 text-right"
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
