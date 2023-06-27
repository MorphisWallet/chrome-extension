import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SUI_TYPE_ARG } from '@mysten/sui.js'

import { Loading } from '_src/ui/app/components'
import { DelegatedAPY } from '_src/ui/app/shared/delegated_apy'

import { useGetDelegatedStake } from '_app/pages/staking/useGetDelegatedStake'
import { useFormatCoin } from '_src/ui/core'

import StakingCoin from '_assets/icons/staking_coin.svg'

import type { SuiAddress } from '@mysten/sui.js'

type StakingButtonProps = {
  address: SuiAddress
}

const StakingButton = ({ address }: StakingButtonProps) => {
  const { data: delegatedStake, isLoading } = useGetDelegatedStake(address)

  const totalActivePendingStake = useMemo(() => {
    if (!delegatedStake) return 0n

    return delegatedStake.reduce(
      (acc, curr) =>
        curr.stakes.reduce(
          (total, { principal }) => total + BigInt(principal),
          acc
        ),

      0n
    )
  }, [delegatedStake])

  const stakedValidators =
    delegatedStake?.map(({ validatorAddress }) => validatorAddress) || []

  const [, , queryResult] = useFormatCoin(totalActivePendingStake, SUI_TYPE_ARG)

  return (
    <Link
      className="min-h-[40px] mx-6 mb-6 py-2 flex items-center justify-center rounded-[5px] bg-[#A7D9E3] cursor-pointer transition hover:opacity-80 hover:scale-[1.02]"
      to="/stake"
    >
      <Loading loading={isLoading || queryResult.isLoading}>
        <>
          <StakingCoin className="mr-2" height={25} width={34} />
          <div className="flex font-medium">
            <span>Stake SUI and earn up to</span>
            <span>&nbsp;</span>
            <DelegatedAPY stakedValidators={stakedValidators} />
          </div>
        </>
      </Loading>
    </Link>
  )
}

export default StakingButton
