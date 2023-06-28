import { useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { IconWrapper, Loading, toast, Button } from '_app/components'
import StakingAmount from './components/staking_amount'
import ValidatorStakingStat from './components/validator_staking_stat'

import { useActiveAddress } from '_hooks'
import { useGetDelegatedStake } from './useGetDelegatedStake'
import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'

import { getAllStakeSui } from './getAllStakeSui'

import ArrowShort from '_assets/icons/arrow_short.svg'

const StakingPage = () => {
  const navigate = useNavigate()
  const accountAddress = useActiveAddress()
  const {
    data: delegatedStake,
    isLoading,
    isError,
    error,
  } = useGetDelegatedStake(accountAddress || '')

  const { data: system } = useGetSystemState()
  const activeValidators = system?.activeValidators

  const totalStake = useMemo(() => {
    if (!delegatedStake) return 0n
    return getAllStakeSui(delegatedStake)
  }, [delegatedStake])

  const delegations = useMemo(() => {
    return delegatedStake?.flatMap((delegation) => {
      return delegation.stakes.map((d) => ({
        ...d,
        // flag any inactive validator for the stakeSui object
        // if the stakingPoolId is not found in the activeValidators list flag as inactive
        inactiveValidator: !activeValidators?.find(
          ({ stakingPoolId }) => stakingPoolId === delegation.stakingPool
        ),
        validatorAddress: delegation.validatorAddress,
      }))
    })
  }, [activeValidators, delegatedStake])

  // Check if there are any inactive validators
  const hasInactiveValidatorDelegation = delegations?.some(
    ({ inactiveValidator }) => inactiveValidator
  )

  // Get total rewards for all delegations
  const totalEarnTokenReward = useMemo(() => {
    if (!delegatedStake || !activeValidators) return 0n
    return (
      delegatedStake.reduce(
        (acc, curr) =>
          curr.stakes.reduce(
            (total, { estimatedReward }) =>
              total + BigInt(estimatedReward || 0),
            acc
          ),
        0n
      ) || 0n
    )
  }, [delegatedStake, activeValidators])

  const numberOfValidators = delegatedStake?.length || 0

  useEffect(() => {
    if (isError) {
      toast({
        type: 'error',
        message: error?.message,
      })
    }
  }, [isError])

  return (
    <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
      <div className="mb-6 text-xl text-center font-bold relative">
        Stake SUI
        <span
          className="absolute left-0 top-[7px]"
          onClick={() => navigate('/')}
        >
          <IconWrapper>
            <ArrowShort height={10} width={13} />
          </IconWrapper>
        </span>
      </div>
      <div className="flex flex-col grow overflow-y-auto px-6 mx-[-24px]">
        <Loading loading={isLoading}>
          <p>
            Staking on {numberOfValidators || '-'} validator
            {numberOfValidators > 1 ? 's' : ''}
          </p>
          <p>Your stake</p>
          <p>
            <StakingAmount balance={totalStake} />
          </p>
          <p>
            <StakingAmount balance={totalEarnTokenReward} />
            earned
          </p>
          <div className="grow">
            {system &&
              delegations?.map((_delegation) => (
                <ValidatorStakingStat
                  currentEpoch={Number(system.epoch)}
                  delegationObject={_delegation}
                  key={_delegation.stakedSuiId}
                />
              ))}
          </div>
          <Link to="/staking/new">
            <Button>Stake SUI</Button>
          </Link>
        </Loading>
      </div>
    </div>
  )
}

export default StakingPage
