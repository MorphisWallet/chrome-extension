import { useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import Layout from '_app/layouts'
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
  // const hasInactiveValidatorDelegation = delegations?.some(
  //   ({ inactiveValidator }) => inactiveValidator
  // )

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
    <Layout showHeader={false} showNav={false}>
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
        <div className="flex flex-col grow overflow-y-auto px-6 mx-[-24px] text-center">
          <Loading loading={isLoading}>
            <div className="pb-6 px-6 -mx-6 border-b border-b-[#EFEFEF]">
              <p className="font-bold leading-[48px]">
                Staking on {numberOfValidators || '-'} validator
                {numberOfValidators > 1 ? 's' : ''}
              </p>
              <p className="font-medium text-[#7E7E7E] leading-[24px]">
                Your stake
              </p>
              <p className="leading-[48px]">
                <StakingAmount
                  balance={totalStake}
                  formatClassName="text-[48px] font-bold"
                />
              </p>
              <p className="mb-2">
                <StakingAmount
                  balance={totalEarnTokenReward}
                  formatClassName="font-bold"
                />
                &nbsp;earned
              </p>
            </div>
            <div className="flex flex-col gap-4 grow px-6 py-4 mb-4 -mx-6 overflow-x-hidden overflow-y-auto">
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
    </Layout>
  )
}

export default StakingPage
