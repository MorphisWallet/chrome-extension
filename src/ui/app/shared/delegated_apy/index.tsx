// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'

import { Loading } from '_app/components'

import { useGetValidatorsApy } from '_src/ui/core/hooks/useGetValidatorsApy'
import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'
import { roundFloat } from '_src/ui/core'

import { type SuiAddress } from '@mysten/sui.js'

const APY_DECIMALS = 3

type DelegatedAPYProps = {
  stakedValidators: SuiAddress[]
}

export function DelegatedAPY({ stakedValidators }: DelegatedAPYProps) {
  const { data, isLoading } = useGetSystemState()
  const { data: rollingAverageApys } = useGetValidatorsApy()

  const averageNetworkAPY = useMemo(() => {
    if (!data || !rollingAverageApys) return null

    let stakedAPYs = 0

    stakedValidators.forEach((validatorAddress) => {
      stakedAPYs += rollingAverageApys?.[validatorAddress]?.apy || 0
    })

    const averageAPY = stakedAPYs / stakedValidators.length

    return roundFloat(averageAPY || 0, APY_DECIMALS)
  }, [data, rollingAverageApys, stakedValidators])

  return (
    <div className="flex gap-0.5 items-center">
      <Loading loading={isLoading}>
        {averageNetworkAPY !== null ? (
          <>
            <span>{averageNetworkAPY}</span>
            <span>% APY</span>
          </>
        ) : (
          <span>--</span>
        )}
      </Loading>
    </div>
  )
}
