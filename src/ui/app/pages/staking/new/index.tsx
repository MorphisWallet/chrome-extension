import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SUI_TYPE_ARG } from '@mysten/sui.js'

import { IconWrapper, Loading, toast, Button } from '_app/components'
import { CountDownTimer } from '_src/ui/app/shared/countdown_timer'

import { useActiveAddress } from '_src/ui/app/hooks'
import { useGetCoinBalance } from '_src/ui/app/hooks'
import { useGetDelegatedStake } from '../useGetDelegatedStake'
import { useGetValidatorsApy } from '_src/ui/core/hooks/useGetValidatorsApy'
import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'

import { getDelegationDataByStakeId } from '../getDelegationByStakeId'
import { useGetTimeBeforeEpochNumber } from '_src/ui/core/hooks/useGetTimeBeforeEpochNumber'

import {
  NUM_OF_EPOCH_BEFORE_STAKING_REWARDS_STARTS,
  NUM_OF_EPOCH_BEFORE_STAKING_REWARDS_REDEEMABLE,
} from '_src/shared/constants'

import ArrowShort from '_assets/icons/arrow_short.svg'
import ValidatorLogo from '../components/validator_logo'

const StakingNew = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const validatorAddress =
    searchParams.get('address') ||
    '0xa987c410fa047b973d479555894c85208c4450ef65fd1d8d5911b46fbca83365'
  const stakeSuiIdParams = searchParams.get('staked')

  const accountAddress = useActiveAddress()
  const { data: system, isLoading: validatorsIsloading } = useGetSystemState()
  const { data: suiBalance, isLoading: loadingSuiBalances } = useGetCoinBalance(
    SUI_TYPE_ARG,
    accountAddress
  )
  const { data: allDelegation, isLoading } = useGetDelegatedStake(
    accountAddress || ''
  )
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

  const stakeData = useMemo(() => {
    if (!allDelegation || !stakeSuiIdParams) return null
    // return delegation data for a specific stakeId
    return getDelegationDataByStakeId(allDelegation, stakeSuiIdParams)
  }, [allDelegation, stakeSuiIdParams])

  if (!validatorAddress) return null

  const { apy, isApyApproxZero } = rollingAverageApys?.[validatorAddress] ?? {
    apy: 0,
  }

  return (
    <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
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
      <div className="flex flex-col grow overflow-y-auto px-6 mx-[-24px]">
        <div className="flex items-center my-6 px-8 py-2 rounded-[30px] bg-[#f2faff] cursor-pointer transition hover:opacity-80 hover:scale-[1.01]">
          <ValidatorLogo validatorAddress={validatorAddress} />
          <ArrowShort className="h-[12px] w-[12px] rotate-180" />
        </div>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Staking APY</span>
          <span>
            {isApyApproxZero ? '~' : ''}
            {apy}%
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
          <span className="text-[#a0a0a0]">Gas budget</span>
          <span></span>
        </p>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Your staked SUI</span>
          <span></span>
        </p>
      </div>
    </div>
  )
}

export default StakingNew
