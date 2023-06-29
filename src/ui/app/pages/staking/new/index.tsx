import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import BigNumber from 'bignumber.js'
import throttle from 'lodash/throttle'
import { SUI_TYPE_ARG } from '@mysten/sui.js'

import { Button, IconWrapper, Loading, Input } from '_app/components'
import { CountDownTimer } from '_src/ui/app/shared/countdown_timer'
import StakingAmount from '../components/staking_amount'
import { CoinIcon } from '_app/components'
import StakingConfirmModal from './components/StakingConfirmModal'

import { useActiveAddress } from '_src/ui/app/hooks'
import { useGetCoinBalance } from '_src/ui/app/hooks'
import { useGetDelegatedStake } from '../useGetDelegatedStake'
import { useGetValidatorsApy } from '_src/ui/core/hooks/useGetValidatorsApy'
import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'
import { useFormatCoin } from '_src/ui/core'
import { useTransactionGasBudget } from '_src/ui/app/hooks'
import { useCoinMetadata } from '_src/ui/core'

import { getTokenStakeSuiForValidator } from '../getTokenStakeSuiForValidator'
import { useGetTimeBeforeEpochNumber } from '_src/ui/core/hooks/useGetTimeBeforeEpochNumber'
import { Coin } from '_redux/slices/sui-objects/Coin'
import { createStakeTransaction } from '../transaction'
import { parseAmount } from '_src/ui/app/helpers'

import {
  NUM_OF_EPOCH_BEFORE_STAKING_REWARDS_STARTS,
  NUM_OF_EPOCH_BEFORE_STAKING_REWARDS_REDEEMABLE,
} from '_src/shared/constants'

import ArrowShort from '_assets/icons/arrow_short.svg'
import ValidatorLogo from '../components/validator_logo'

type Fields = {
  amount: string
}

const StakingNew = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const validatorAddress =
    searchParams.get('address') ||
    '0xa987c410fa047b973d479555894c85208c4450ef65fd1d8d5911b46fbca83365'

  const accountAddress = useActiveAddress()
  const { data: system, isLoading: validatorsIsloading } = useGetSystemState()
  const { data: suiBalance, isLoading: loadingSuiBalances } = useGetCoinBalance(
    SUI_TYPE_ARG,
    accountAddress
  )
  const { data: metadata } = useCoinMetadata(SUI_TYPE_ARG)
  const coinDecimals = metadata?.decimals ?? 0
  const [maxToken, symbol] = useFormatCoin(
    BigInt(suiBalance?.totalBalance || 0),
    SUI_TYPE_ARG
  )
  const { data: allDelegation, isLoading: delegationLoading } =
    useGetDelegatedStake(accountAddress || '')
  const { data: rollingAverageApys, isLoading: apyLoading } =
    useGetValidatorsApy()

  const startEarningRewardsEpoch =
    Number(system?.epoch || 0) + NUM_OF_EPOCH_BEFORE_STAKING_REWARDS_STARTS
  const redeemableRewardsEpoch =
    Number(system?.epoch || 0) + NUM_OF_EPOCH_BEFORE_STAKING_REWARDS_REDEEMABLE

  const { data: timeBeforeStakeRewardsStarts } = useGetTimeBeforeEpochNumber(
    startEarningRewardsEpoch
  )
  const { data: timeBeforeStakeRewardsRedeemable } =
    useGetTimeBeforeEpochNumber(redeemableRewardsEpoch)

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
  } = useFormik<Fields>({
    initialValues: {
      amount: '',
    },
    validationSchema: Yup.object().shape({
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
        .test('min', `Amount must be greater than 1`, (amount?: BigNumber) => {
          return amount
            ? amount.gte(new BigNumber(1).shiftedBy(coinDecimals))
            : false
        })
        .test('max', 'Not enough balance', (amount?: BigNumber) =>
          amount
            ? amount
                .shiftedBy(coinDecimals)
                .lte(
                  new BigNumber(suiBalance?.totalBalance || 0).shiftedBy(
                    coinDecimals
                  )
                )
            : false
        ),
    }),
    onSubmit: async () => {
      setConfirmModalOpen(true)
    },
  })

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [selectValidatorsModalOpen, setSelectValidatorsConfirmModalOpen] =
    useState(false)

  const coinSymbol = useMemo(() => Coin.getCoinSymbol(SUI_TYPE_ARG) || '', [])

  const transaction = useMemo(
    throttle(() => {
      if (!values.amount || !metadata?.decimals) return null
      const amountWithoutDecimals = parseAmount(
        values.amount,
        metadata.decimals
      )
      return createStakeTransaction(amountWithoutDecimals, validatorAddress)
    }, 500),
    [values.amount, validatorAddress, metadata?.decimals]
  )

  const { data: gasBudget, isLoading: gasLoading } = useTransactionGasBudget(
    accountAddress,
    transaction
  )

  const totalStake = useMemo(() => {
    if (!allDelegation) return 0n
    return getTokenStakeSuiForValidator(allDelegation, validatorAddress)
  }, [allDelegation, validatorAddress])

  if (!validatorAddress) return null

  const { apy, isApyApproxZero } = rollingAverageApys?.[validatorAddress] ?? {
    apy: 0,
  }

  return (
    <div className="relative flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
      <StakingConfirmModal
        open={confirmModalOpen}
        setOpen={setConfirmModalOpen}
        validatorAddress={validatorAddress}
        stake={`${values.amount} ${symbol}`}
        apy={apy}
        timeBeforeStakeRewardsStarts={timeBeforeStakeRewardsStarts}
        epoch={system?.epoch}
        startEarningRewardsEpoch={startEarningRewardsEpoch}
        gas={`${gasBudget} ${symbol}`}
      />
      <div className="mb-6 text-xl text-center font-bold relative">
        Stake SUI
        <span
          className="absolute left-0 top-[7px]"
          onClick={() => navigate('/staking')}
        >
          <IconWrapper>
            <ArrowShort height={10} width={13} />
          </IconWrapper>
        </span>
      </div>
      <div className="flex flex-col px-6 pb-6 mx-[-24px] border-b border-b-[#EFEFEF]">
        <div className="flex items-center my-6 px-8 py-2 rounded-[30px] bg-[#f2faff] cursor-pointer transition hover:opacity-80 hover:scale-[1.01]">
          <Loading loading={validatorsIsloading}>
            <ValidatorLogo validatorAddress={validatorAddress} />
            <ArrowShort className="h-[12px] w-[12px] rotate-180" />
          </Loading>
        </div>
        <p className="mb-2 flex justify-between">
          <span className="shrink-0 text-[#a0a0a0]">Staking APY</span>
          <span>
            <Loading loading={apyLoading}>
              {isApyApproxZero ? '~' : ''}
              {apy}%
            </Loading>
          </span>
        </p>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Staking rewards start</span>
          <span>
            {timeBeforeStakeRewardsStarts > 0 ? (
              <CountDownTimer
                endLabel="--"
                label="in"
                timestamp={timeBeforeStakeRewardsStarts}
              />
            ) : system?.epoch ? (
              `Epoch #${Number(startEarningRewardsEpoch)}`
            ) : (
              '--'
            )}
          </span>
        </p>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Staking rewards redeemable</span>
          <span>
            {timeBeforeStakeRewardsRedeemable > 0 ? (
              <CountDownTimer
                endLabel="--"
                label="in"
                timestamp={timeBeforeStakeRewardsRedeemable}
              />
            ) : system?.epoch ? (
              `Epoch #${Number(redeemableRewardsEpoch)}`
            ) : (
              '--'
            )}
          </span>
        </p>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Your staked SUI</span>
          <div>
            <Loading loading={delegationLoading}>
              <StakingAmount balance={totalStake} />
            </Loading>
          </div>
        </p>
      </div>
      <div className="flex flex-col grow pt-6">
        <p className="mb-2 flex justify-between">
          <span>Amount to stake</span>
          <div className="text-[#a0a0a0]">
            <Loading loading={loadingSuiBalances}>
              <span>
                {maxToken} {symbol}
              </span>
            </Loading>
          </div>
        </p>
        <form className="relative" id="form" onSubmit={handleSubmit}>
          <CoinIcon
            type={SUI_TYPE_ARG}
            className="absolute h-6 w-6 top-[9px] left-4 mr-2 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
          />
          <span className="absolute text-sm top-3 left-12">{coinSymbol}</span>
          <Input
            id="amount"
            name="amount"
            value={values.amount}
            placeholder="0.00"
            disabled={loadingSuiBalances}
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
        </form>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Gas budget</span>
          <div>
            <Loading loading={!!values.amount && gasLoading}>
              {gasBudget || '-'} {symbol}
            </Loading>
          </div>
        </p>
      </div>
      <Button
        disabled={
          loadingSuiBalances || gasLoading || !!errors.amount || !values.amount
        }
        form="form"
        loading={isSubmitting}
        type="submit"
      >
        Stake
      </Button>
    </div>
  )
}

export default StakingNew
