import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { Formik, FormikProps } from 'formik'
import BigNumber from 'bignumber.js'
import * as Yup from 'yup'
import { getTransactionDigest } from '@mysten/sui.js'

import { Layout } from '_app/layouts'
import { IconWrapper, toast, TxLink } from '_app/components'
import { StepOne } from './components/step_one'
import { StepTwo } from './components/step_two'

import {
  useAppDispatch,
  useAppSelector,
  useCoinDecimals,
  useObjectsState,
  useFormatCoin,
} from '_hooks'

import {
  accountAggregateBalancesSelector,
  accountCoinsSelector,
} from '_redux/slices/account'
import { sendTokens } from '_redux/slices/transactions'

import { Coin, GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin'
import { suiAddressValidation } from '_app/utils/validation'
import { parseAmount } from './utils'

import ArrowShort from '_assets/icons/arrow_short.svg'

import { ExplorerLinkType } from '_app/components/tx_link/type'
import type { ConfirmFields } from './utils'
import type { SerializedError } from '@reduxjs/toolkit'

export const Send = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const coinType = searchParams.get('type') || ''

  const allCoins = useAppSelector(accountCoinsSelector)
  const aggregateBalances = useAppSelector(accountAggregateBalancesSelector)
  const coinBalance = useMemo(
    () => (coinType && aggregateBalances[coinType]) || BigInt(0),
    [coinType, aggregateBalances]
  )

  const [, symbol] = useFormatCoin(coinBalance, coinType, true)
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
  const gasAggregateBalance = useMemo(
    () => aggregateBalances[GAS_TYPE_ARG] || BigInt(0),
    [aggregateBalances]
  )

  if (!coinType) {
    return <Navigate to="/" replace={true} />
  }

  const onSubmit = async (values: ConfirmFields) => {
    if (step === 0) {
      setStep(1)
      return
    }

    if (!coinType) {
      return
    }

    try {
      const bigIntAmount = BigInt(
        BigNumber(values.amount.replace(',', '.'))
          .shiftedBy(coinDecimals)
          .integerValue()
          .toString()
      )
      const res = await dispatch(
        sendTokens({
          amount: bigIntAmount,
          recipientAddress: values.address,
          tokenTypeArg: coinType,
        })
      ).unwrap()

      const txDigest = getTransactionDigest(res)

      navigate('/')
      // use macro task to navitgate first, render toast secondly
      // otherwise, toast providers will be re-rendered, and nothing happens
      setTimeout(() => {
        toast({
          type: 'success',
          message: (
            <p>
              Successfully sent {values.amount} {symbol}
              {'. '}
              <TxLink
                type={ExplorerLinkType.transaction}
                transactionID={txDigest}
                className="text-[#bef9ff]"
              >
                View on explorer
              </TxLink>
            </p>
          ),
        })
      }, 0)
    } catch (e) {
      toast({
        type: 'error',
        message: (e as SerializedError).message || null,
      })
    }
  }

  const renderContent = (formikProps: FormikProps<ConfirmFields>) => {
    if (step === 0) {
      return (
        <StepOne
          loading={loading}
          formikProps={formikProps}
          coinBalance={coinBalance}
          coinType={coinType}
        />
      )
    }

    return (
      <StepTwo
        formikProps={formikProps}
        coinBalance={coinBalance}
        coinType={coinType}
        allCoinsOfSelectedTypeArg={allCoinsOfSelectedTypeArg}
      />
    )
  }

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
        <div className="mb-6 text-xl text-center font-bold relative">
          {step === 0 ? 'Send' : 'Confirm send'}
          <IconWrapper
            onClick={() => {
              step === 0 ? navigate(-1) : setStep(0)
            }}
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
              .test('max', 'Not enough balance', (amount?: BigNumber) =>
                amount
                  ? amount.shiftedBy(coinDecimals).lte(coinBalance.toString())
                  : false
              )
              .test(
                'gas-check',
                'Not enough balance to cover gas fee',
                (amount?: BigNumber) => {
                  if (!amount) return false

                  const gasBudget = Coin.computeGasBudgetForPay(
                    allCoinsOfSelectedTypeArg,
                    BigInt(amount.shiftedBy(coinDecimals).toNumber())
                  )
                  try {
                    let availableGas = gasAggregateBalance
                    if (coinType === GAS_TYPE_ARG) {
                      availableGas -= BigInt(
                        amount.shiftedBy(coinDecimals).toString()
                      )
                    }
                    return availableGas >= gasBudget
                  } catch (e) {
                    return false
                  }
                }
              ),
            address: suiAddressValidation,
          })}
          onSubmit={onSubmit}
        >
          {(formikProps) => (
            <form
              autoComplete="off"
              onSubmit={formikProps.handleSubmit}
              className="flex flex-col grow"
            >
              {renderContent(formikProps)}
            </form>
          )}
        </Formik>
      </div>
    </Layout>
  )
}
