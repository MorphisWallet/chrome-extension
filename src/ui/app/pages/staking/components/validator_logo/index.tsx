import { useMemo } from 'react'

import { Loading } from '_src/ui/app/components'

import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'

import type { SuiAddress } from '@mysten/sui.js'

type ValidatorLogoProps = {
  validatorAddress: SuiAddress
}

const ValidatorLogo = ({ validatorAddress }: ValidatorLogoProps) => {
  const { data, isLoading } = useGetSystemState()

  const validatorMeta = useMemo(() => {
    if (!data) return null

    return (
      data.activeValidators.find(
        (validator) => validator.suiAddress === validatorAddress
      ) || null
    )
  }, [validatorAddress, data])

  return (
    <Loading loading={isLoading}>
      <img
        alt={validatorMeta?.name}
        className="h-[14px] w-[14px] mr-2 shrink-0 rounded-full"
        src={validatorMeta?.imageUrl}
      />
      <span className="grow text-left text-ellipsis overflow-hidden">
        {validatorMeta?.name || '-'}
      </span>
    </Loading>
  )
}

export default ValidatorLogo
