import { Link } from 'react-router-dom'
import { SUI_TYPE_ARG } from '@mysten/sui.js'

import StakingAmount from '../staking_amount'
import ValidatorLogo from '../validator_logo'
import { CountDownTimer } from '_src/ui/app/shared/countdown_timer'

import { useFormatCoin } from '_src/ui/core'
import { useGetTimeBeforeEpochNumber } from '_src/ui/core/hooks/useGetTimeBeforeEpochNumber'

import { NUM_OF_EPOCH_BEFORE_STAKING_REWARDS_REDEEMABLE } from '_src/shared/constants'
import { StakeState, STATUS_TEXT } from './utils'

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

  // Applicable only for warm up
  const epochBeforeRewards =
    delegationState === StakeState.WARM_UP ? earningRewardsEpoch : null

  const { data: rewardEpochTime } = useGetTimeBeforeEpochNumber(
    Number(epochBeforeRewards)
  )

  const rewards =
    isEarnedRewards && estimatedReward ? BigInt(estimatedReward) : 0n

  const [rewardsStaked, symbol] = useFormatCoin(rewards, SUI_TYPE_ARG)

  const statusText = {
    // Epoch time before earning
    [StakeState.WARM_UP]: `Epoch #${earningRewardsEpoch}`,
    [StakeState.EARNING]: `${rewardsStaked} ${symbol}`,
    // Epoch time before redrawing
    [StakeState.COOL_DOWN]: `Epoch #`,
    [StakeState.WITHDRAW]: 'Now',
    [StakeState.IN_ACTIVE]: 'Not earning rewards',
  }

  return (
    <Link
      className="flex flex-col px-4 py-2 bg-[#f2faff] rounded-[10px] transition hover:opacity-80 hover:scale-[1.01]"
      to={`/staking/details?${new URLSearchParams({
        validator: validatorAddress,
        staked: stakedSuiId,
      }).toString()}`}
    >
      <div className="mb-2 flex items-center">
        <ValidatorLogo validatorAddress={validatorAddress} />
        <ArrowShort className="h-[12px] w-[12px] rotate-180" />
      </div>
      <p className="mb-2 flex justify-between">
        <span className="text-[#a0a0a0]">Stake amount</span>
        <StakingAmount
          balance={inactiveValidator ? principal + rewards : principal}
        />
      </p>
      <p className="flex justify-between">
        <span className="text-[#a0a0a0]">{STATUS_TEXT[delegationState]}</span>
        <span>
          {Number(epochBeforeRewards) && rewardEpochTime > 0 ? (
            <CountDownTimer timestamp={rewardEpochTime} label="in" />
          ) : (
            statusText[delegationState]
          )}
        </span>
      </p>
    </Link>
  )
}

export default ValidatorStakingStat
