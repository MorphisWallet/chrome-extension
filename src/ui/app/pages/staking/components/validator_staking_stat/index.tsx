import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SUI_TYPE_ARG } from '@mysten/sui.js'

import { Loading } from '_src/ui/app/components'
import StakingAmount from '../staking_amount'

import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'
import { useFormatCoin } from '_src/ui/core'

import { NUM_OF_EPOCH_BEFORE_STAKING_REWARDS_REDEEMABLE } from '_src/shared/constants'
import { StakeState } from './utils'

import ArrowShort from '_assets/icons/arrow_short.svg'

import type { StakeObject, SuiAddress } from '@mysten/sui.js'

type DelegationObjectWithValidator = StakeObject & {
  validatorAddress: SuiAddress
}

type ValidatorStakingStatProps = {
  delegationObject: DelegationObjectWithValidator
  currentEpoch: number
  inactiveValidator?: boolean
}

const ValidatorStakingStat = ({
  delegationObject,
  currentEpoch,
  inactiveValidator,
}: ValidatorStakingStatProps) => {
  const {
    stakedSuiId,
    principal,
    stakeRequestEpoch,
    estimatedReward,
    validatorAddress,
  } = delegationObject

  // TODO: Once two step withdraw is available, add cool down and withdraw now logic
  // For cool down epoch, show Available to withdraw add rewards to principal
  // Reward earning epoch is 2 epochs after stake request epoch
  const earningRewardsEpoch =
    Number(stakeRequestEpoch) + NUM_OF_EPOCH_BEFORE_STAKING_REWARDS_REDEEMABLE
  const isEarnedRewards = currentEpoch >= Number(earningRewardsEpoch)
  const delegationState = inactiveValidator
    ? StakeState.IN_ACTIVE
    : isEarnedRewards
    ? StakeState.EARNING
    : StakeState.WARM_UP

  const rewards =
    isEarnedRewards && estimatedReward ? BigInt(estimatedReward) : 0n

  const { data, isLoading } = useGetSystemState()

  const validatorMeta = useMemo(() => {
    if (!data) return null

    return (
      data.activeValidators.find(
        (validator) =>
          validator.suiAddress === delegationObject.validatorAddress
      ) || null
    )
  }, [delegationObject.validatorAddress, data])

  return (
    <Link
      className="flex flex-col px-4 py-2 bg-[#f2faff] rounded-[10px] transition hover:opacity-80 hover:scale-[1.01]"
      to={`/staking/details?${new URLSearchParams({
        validator: validatorAddress,
        staked: stakedSuiId,
      }).toString()}`}
    >
      <Loading loading={isLoading}>
        <div className="mb-2 flex items-center">
          <img
            alt={validatorMeta?.name}
            className="h-[14px] w-[14px] mr-2 shrink-0 rounded-full"
            src={validatorMeta?.imageUrl}
          />
          <span className="grow text-ellipsis overflow-hidden">
            {validatorMeta?.name || 'unknown validator'}
          </span>
          <ArrowShort className="h-[12px] w-[12px] rotate-180" />
        </div>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Stake amount</span>
          <StakingAmount
            balance={inactiveValidator ? principal + rewards : principal}
          />
        </p>
        <p className="flex justify-between">
          {delegationState === StakeState.WARM_UP && (
            <span className="text-[#a0a0a0]">
              Starts Earning Epoch #{earningRewardsEpoch}
            </span>
          )}
          {delegationState === StakeState.EARNING && (
            <>
              <span className="text-[#a0a0a0]">Rewards earned</span>
              <StakingAmount balance={rewards} />
            </>
          )}
          {delegationState === StakeState.IN_ACTIVE && (
            <span className="text-[#a0a0a0]">
              Inactive, Not earning rewards
            </span>
          )}
        </p>
      </Loading>
    </Link>
  )
}

export default ValidatorStakingStat
