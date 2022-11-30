import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { Formik, FormikProps } from 'formik'
import BigNumber from 'bignumber.js'
import * as Yup from 'yup'

import { Layout } from '_app/layouts'
import { IconWrapper, Input, Loading } from '_app/components'

import {
  useAppSelector,
  useFormatCoin,
  useCoinDecimals,
  useObjectsState,
} from '_hooks'

import {
  accountAggregateBalancesSelector,
  accountCoinsSelector,
} from '_redux/slices/account'

import { coinMap } from '_app/utils/coin'
import { Coin } from '_redux/slices/sui-objects/Coin'
import { suiAddressValidation } from '_app/utils/validation'

import ArrowShort from '_assets/icons/arrow_short.svg'

type FieldValues = {
  amount: string
  address: string
}

const parseAmount = (amount: string): BigNumber => {
  try {
    return BigNumber(amount)
  } catch (e) {
    return BigNumber(0)
  }
}

export const Send = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const coinType = searchParams.get('type') || ''

  const allCoins = useAppSelector(accountCoinsSelector)
  const balances = useAppSelector(accountAggregateBalancesSelector)
  const coinBalance = balances?.[coinType] || BigInt(0)

  const [formattedBalance, symbol] = useFormatCoin(coinBalance, coinType, true)
  const [coinDecimals] = useCoinDecimals(coinType)
  const { loading } = useObjectsState()

  const [step, setStep] = useState<0 | 1>(0)

  const allCoinsOfSelectedTypeArg = useMemo(
    () =>
      allCoins.filter(
        (aCoin) => coinType && Coin.getCoinTypeArg(aCoin) === coinType
      ),
    [coinType, allCoins]
  )

  if (!coinType) {
    return <Navigate to="/" replace={true} />
  }

  const coinInfo = coinMap[coinType]

  const renderContent = ({
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
  }: FormikProps<FieldValues>) => {
    if (step === 0) {
      return (
        <form className="flex flex-col grow">
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
                if (!/^\d+((\.|,)\d{0,9})?$/g.test(e.target.value)) {
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
        </form>
      )
    }

    return <form></form>
  }

  const onSubmit = () => {
    //
  }

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
        <div className="mb-6 text-xl text-center font-bold relative">
          Send
          <IconWrapper
            onClick={() => navigate(-1)}
            className="absolute left-0 top-[8px]"
          >
            <ArrowShort height={10} width={13} />
          </IconWrapper>
        </div>
        <Formik
          initialValues={{
            amount: '',
            address: '',
          }}
          validationSchema={Yup.object().shape({
            amount: Yup.mixed()
              .test('required', 'Amount is required', (value) => !!value)
              .transform((_, original: string) =>
                parseAmount(original.replace(',', '.'))
              )
              .test('valid', 'Invalid amount', (value?: BigNumber) => {
                if (!value || value.isNaN() || !value.isFinite()) {
                  return false
                }
                return true
              })
              .test(
                'max-decimals',
                `The amount exeeds the maximum decimals (${coinDecimals})`,
                (amount?: BigNumber) => {
                  if (!amount) return false

                  const decimals = amount.decimalPlaces()
                  if (decimals === null) return false

                  return decimals <= coinDecimals
                }
              )
              .test(
                'min',
                `Amount must be greater than 0`,
                (amount?: BigNumber) => (amount ? amount.gt(0) : false)
              )
              .test('max', 'Not enough balance ', (amount?: BigNumber) => {
                if (!amount) return false

                const gasBudget = Coin.computeGasBudgetForPay(
                  allCoinsOfSelectedTypeArg,
                  BigInt(amount.shiftedBy(coinDecimals).toNumber())
                )
                if (
                  amount
                    .shiftedBy(coinDecimals)
                    .plus(BigNumber(gasBudget))
                    .isGreaterThan(BigNumber(coinBalance.toString()))
                ) {
                  return false
                }

                return true
              }),
            address: suiAddressValidation,
          })}
          onSubmit={onSubmit}
        >
          {(formikProps) => renderContent(formikProps)}
        </Formik>
      </div>
    </Layout>
  )
}
