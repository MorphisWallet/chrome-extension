import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import Layout from '_app/layouts'
import { Button, IconWrapper, Loading } from '_app/components'
import ValidatorLogo from '../components/validator_logo'
import StakingAmount from '../components/staking_amount'

import { useActiveAddress } from '_src/ui/app/hooks'
import { useSigner } from '_src/ui/app/hooks'
import { useGetDelegatedStake } from '../useGetDelegatedStake'
import { useGetValidatorsApy } from '_src/ui/core/hooks/useGetValidatorsApy'
import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'
import { useTransactionGasBudget } from '_src/ui/app/hooks'

import { createUnstakeTransaction } from '../transaction'
import { getStakeSuiBySuiId } from '../getStakeSuiBySuiId'
import { calculateStakeShare } from '_src/ui/core/utils/calculateStakeShare'
import { getDelegationDataByStakeId } from '../getDelegationByStakeId'

import { GAS_SYMBOL } from '_src/ui/app/redux/slices/sui-objects/Coin'

import ArrowShort from '_assets/icons/arrow_short.svg'

const Unstake = () => {
  const [searchParams] = useSearchParams()
  const validatorAddress = searchParams.get('address')
  const stakeId = searchParams.get('staked')
  const navigate = useNavigate()

  const accountAddress = useActiveAddress()
  const signer = useSigner()

  const { data: system, isLoading: systemLoading } = useGetSystemState()
  const { data: allDelegation, isLoading } = useGetDelegatedStake(
    accountAddress || ''
  )
  const { data: rollingAverageApys, isLoading: apyLoading } =
    useGetValidatorsApy()
  const { apy, isApyApproxZero } = rollingAverageApys?.[
    validatorAddress || ''
  ] ?? {
    apy: 0,
  }

  const validatorData = useMemo(() => {
    if (!system) return null

    return (
      system.activeValidators.find(
        (_validator) => _validator.suiAddress === validatorAddress
      ) || null
    )
  }, [validatorAddress, system])

  const totalStake = useMemo(() => {
    if (!system) return 0
    return system.activeValidators.reduce(
      (acc, curr) => (acc += BigInt(curr.stakingPoolSuiBalance)),
      0n
    )
  }, [system])

  const totalTokenBalance = useMemo(() => {
    if (!allDelegation) return 0n
    // return only the total amount of tokens staked for a specific stakeId
    return getStakeSuiBySuiId(allDelegation, stakeId)
  }, [allDelegation, stakeId])

  const delegationData = useMemo(() => {
    if (!stakeId) return null

    return allDelegation
      ? getDelegationDataByStakeId(allDelegation, stakeId)
      : null
  }, [allDelegation, stakeId])

  const delegationId =
    delegationData?.status === 'Active' && delegationData?.stakedSuiId

  const transaction = useMemo(
    () => (stakeId ? createUnstakeTransaction(stakeId) : null),
    [stakeId]
  )

  const { data: gasBudget, isLoading: gasLoading } = useTransactionGasBudget(
    accountAddress,
    transaction
  )

  const unStakeToken = useMutation({
    mutationFn: async ({ stakedSuiId }: { stakedSuiId: string }) => {
      if (!stakedSuiId || !signer) {
        throw new Error('Failed, missing required field.')
      }

      try {
        const transactionBlock = createUnstakeTransaction(stakedSuiId)
        return await signer.signAndExecuteTransactionBlock({
          transactionBlock,
          requestType: 'WaitForLocalExecution',
          options: {
            showInput: true,
            showEffects: true,
            showEvents: true,
          },
        })
      } catch (error) {
        //
      }
    },
    onSuccess: () => {
      //
    },
  })

  return (
    <Layout showHeader={false} showNav={false}>
      <div className="relative flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
        <div className="mb-6 text-xl text-center font-bold relative">
          Unstake SUI
          <span
            className="absolute left-0 top-[7px]"
            onClick={() => navigate('/staking')}
          >
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </span>
        </div>
        {!!validatorAddress && !!stakeId && (
          <Loading loading={isLoading || systemLoading || gasLoading}>
            <div className="flex flex-col -mx-6 px-6 py-2 border-b border-b-[#EFEFEF]">
              <div className="h-16 flex items-center justify-center my-2">
                <ValidatorLogo
                  iconClassName="!h-8 !w-8"
                  nameClassName="!grow-0"
                  validatorAddress={validatorAddress}
                />
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
                <span className="text-[#a0a0a0]">Stake share</span>
                <span>
                  {calculateStakeShare(
                    BigInt(validatorData?.stakingPoolSuiBalance || 0),
                    BigInt(totalStake)
                  )}
                  %
                </span>
              </p>
            </div>
            <div className="flex flex-col -mx-6 px-6 py-2 border-b border-b-[#EFEFEF]">
              <p className="flex justify-between mb-2">
                <span className="text-[#a0a0a0]">Your stake</span>
                <StakingAmount
                  balance={totalTokenBalance}
                  formatClassName="font-bold"
                />
              </p>
              <p className="flex justify-between">
                <span className="text-[#a0a0a0]">Rewards earned</span>
                <StakingAmount
                  balance={BigInt(delegationData?.estimatedReward || 0n)}
                />
              </p>
            </div>
            <div className="flex flex-col grow py-2">
              <p className="flex justify-between">
                <span className="text-[#a0a0a0]">Gas budget</span>
                <div>
                  <Loading loading={gasLoading}>
                    {gasBudget || '-'} {GAS_SYMBOL}
                  </Loading>
                </div>
              </p>
            </div>
            <Button
              disabled={!totalStake || !delegationId || !gasBudget}
              type="button"
            >
              Unstake now
            </Button>
          </Loading>
        )}
      </div>
    </Layout>
  )
}

export default Unstake
