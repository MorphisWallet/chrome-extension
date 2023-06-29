import { useMemo } from 'react'
import { formatAddress } from '@mysten/sui.js'
import cl from 'classnames'

import { Loading } from '_src/ui/app/components'

import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'

import type { SuiAddress } from '@mysten/sui.js'

type ValidatorLogoProps = {
  validatorAddress: SuiAddress
  showAddress?: boolean
  iconClassName?: string
}

const ValidatorLogo = ({
  validatorAddress,
  showAddress = false,
  iconClassName,
}: ValidatorLogoProps) => {
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
        className={cl([
          'h-[14px] w-[14px] mr-2 shrink-0 rounded-full',
          iconClassName,
        ])}
        src={validatorMeta?.imageUrl}
      />
      {!showAddress && (
        <span className="grow text-left text-ellipsis overflow-hidden">
          {validatorMeta?.name || '-'}
        </span>
      )}
      {showAddress && (
        <span className="flex flex-col">
          <span>{validatorMeta?.name || '-'}</span>
          <span className="text-[#a0a0a0]">
            {formatAddress(validatorAddress)}
          </span>
        </span>
      )}
    </Loading>
  )
}

export default ValidatorLogo
