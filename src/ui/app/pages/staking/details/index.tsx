import { useMemo } from 'react'
import { useSearchParams, useNavigate, Navigate, Link } from 'react-router-dom'

import { Loading, IconWrapper, Button } from '_src/ui/app/components'
import StakingAmount from '../components/staking_amount'

import { useActiveAddress } from '_src/ui/app/hooks'
import { useGetDelegatedStake } from '../useGetDelegatedStake'
import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'
import { useGetValidatorsApy } from '_src/ui/core/hooks/useGetValidatorsApy'

import { getDelegationDataByStakeId } from '../getDelegationByStakeId'

import ArrowShort from '_assets/icons/arrow_short.svg'

const StakingDetails = () => {
  const [searchParams] = useSearchParams()
  const validatorAddressParams = searchParams.get('validator')
  const stakeIdParams = searchParams.get('staked')

  const navigate = useNavigate()
  const accountAddress = useActiveAddress()
  const { data: validatorsData, isLoading: validatorsLoading } =
    useGetSystemState()
  const { data: allDelegation, isLoading: allDelegationLoading } =
    useGetDelegatedStake(accountAddress || '')
  const { data: rollingAverageApys, isLoading: apyLoading } =
    useGetValidatorsApy()

  if (!validatorAddressParams || !stakeIdParams) {
    return <Navigate to="/staking" replace />
  }

  const validatorData = useMemo(() => {
    if (!validatorsData) return null

    return (
      validatorsData.activeValidators.find(
        (validator) => validator.suiAddress === validatorAddressParams
      ) || null
    )
  }, [validatorAddressParams, validatorsData])

  const delegationData = useMemo(() => {
    return allDelegation
      ? getDelegationDataByStakeId(allDelegation, stakeIdParams)
      : null
  }, [allDelegation, stakeIdParams])

  const totalStake = BigInt(delegationData?.principal || 0n)

  const suiEarned = BigInt(delegationData?.estimatedReward || 0n)

  const { apy, isApyApproxZero } = rollingAverageApys?.[
    validatorAddressParams
  ] ?? {
    apy: 0,
  }

  const commission = validatorData
    ? Number(validatorData.commissionRate) / 100
    : 0

  return (
    <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
      <div className="h-[28px] flex items-center justify-center mb-6 text-xl font-bold relative">
        <Loading loading={validatorsLoading}>
          <img
            alt={validatorData?.name}
            className="h-[14px] w-[14px] mr-2 shrink-0 rounded-full"
            src={validatorData?.imageUrl}
          />
          <span className="max-w-[224px] text-ellipsis overflow-hidden">
            {validatorData?.name || 'unknown validator'}
          </span>
        </Loading>
        <span
          className="absolute left-0 top-[7px]"
          onClick={() => navigate('/staking')}
        >
          <IconWrapper>
            <ArrowShort height={10} width={13} />
          </IconWrapper>
        </span>
      </div>
      <div className="flex flex-col p-4 bg-[#f2faff] rounded-[10px]">
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Stake amount</span>
          <StakingAmount balance={totalStake} />
        </p>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Rewards earned</span>
          <StakingAmount balance={suiEarned} />
        </p>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">APY</span>
          <span>
            {isApyApproxZero ? '~' : ''}
            {apy}%
          </span>
        </p>
        <p className="mb-2 flex justify-between">
          <span className="text-[#a0a0a0]">Commission</span>
          <span>{commission}%</span>
        </p>
      </div>
      <div className="grow" />
      <div className="flex gap-2">
        <Link className="grow" to="">
          <Button variant="outlined">Unstake</Button>
        </Link>
        <Link
          className="grow"
          to={`/staking/new?${new URLSearchParams({
            address: validatorAddressParams,
            staked: stakeIdParams,
          }).toString()}`}
        >
          <Button>Stake more</Button>
        </Link>
      </div>
    </div>
  )
}

export default StakingDetails
