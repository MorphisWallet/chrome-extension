import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { Formik, FormikProps } from 'formik'
import BigNumber from 'bignumber.js'
import * as Yup from 'yup'

import Layout from '_app/layouts'
import { IconWrapper, toast } from '_app/components'
import SendStepOne from './components/step_one'
import SendStepTwo from './components/step_two'

import { useActiveAddress, useGetCoinBalance } from '_hooks'
import { useCoinDecimals } from '_src/ui/core'

import { suiAddressValidation } from '_src/ui/utils/validation'

import ArrowShort from '_assets/icons/arrow_short.svg'

import type { ConfirmFields } from './utils'

const SendPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const coinType = searchParams.get('type') || ''

  const activeAddress = useActiveAddress()
  const {
    data: coinBalance,
    isError,
    error,
    isLoading,
  } = useGetCoinBalance(coinType, activeAddress)
  const [coinDecimals] = useCoinDecimals(coinType)

  const [step, setStep] = useState<0 | 1>(0)

  if (!coinType) {
    return <Navigate to="/" replace={true} />
  }

  useEffect(() => {
    if (isError) {
      toast({
        type: 'error',
        message: (error as Error)?.message || 'Failed to load coin balance',
      })
    }
  }, [isError])

  const onSubmit = () => {
    if (step === 0) {
      setStep(1)
      return
    }

    if (!coinType) {
      return
    }
  }

  const renderContent = (formikProps: FormikProps<ConfirmFields>) => {
    if (step === 0) {
      return (
        <SendStepOne
          loading={isLoading}
          formikProps={formikProps}
          coinBalance={coinBalance}
        />
      )
    }

    return <SendStepTwo formikProps={formikProps} coinBalance={coinBalance} />
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
                new BigNumber(original).shiftedBy(coinDecimals).integerValue()
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
                  ? amount
                      .shiftedBy(coinDecimals)
                      .lte(
                        new BigNumber(coinBalance?.totalBalance || 0).shiftedBy(
                          coinDecimals
                        )
                      )
                  : false
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

export default SendPage
