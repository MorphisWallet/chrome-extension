import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import cl from 'classnames'

import { Modal, Loading, IconWrapper } from '_src/ui/app/components'
import ValidatorLogo from '../../../components/validator_logo'

import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'
import { useGetValidatorsApy } from '_src/ui/core/hooks/useGetValidatorsApy'

import { calculateStakeShare } from '_src/ui/core/utils/calculateStakeShare'

import ArrowShort from '_assets/icons/arrow_short.svg'

import type { SuiAddress } from '@mysten/sui.js'

type SelectValidatorModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

enum SortBy {
  NAME_ASC,
  NAME_DESC,
  APY_ASC,
  APY_DESC,
  SHARE_ASC,
  SHARE_DESC,
}

const SelectValidatorModal = ({ open, setOpen }: SelectValidatorModalProps) => {
  const [, setSearchParams] = useSearchParams()

  const { data, isLoading } = useGetSystemState()
  const { data: rollingAverageApys, isLoading: apyLoading } =
    useGetValidatorsApy()

  const [sortBy, setSortBy] = useState<SortBy>(SortBy.NAME_ASC)

  const activeValidators = useMemo(
    () => [...(data?.activeValidators || [])],
    [data?.activeValidators]
  )

  const totalStake = useMemo(() => {
    if (!data) return 0
    return data.activeValidators.reduce(
      (acc, curr) => (acc += BigInt(curr.stakingPoolSuiBalance)),
      0n
    )
  }, [data])

  const validatorList = useMemo(() => {
    return activeValidators
      .map((validator) => {
        const { apy, isApyApproxZero } = rollingAverageApys?.[
          validator.suiAddress
        ] ?? { apy: null }

        return {
          name: validator.name,
          address: validator.suiAddress,
          apy,
          isApyApproxZero,
          stakeShare: calculateStakeShare(
            BigInt(validator.stakingPoolSuiBalance),
            BigInt(totalStake)
          ),
        }
      })
      .sort((a, b) => {
        switch (sortBy) {
          case SortBy.NAME_ASC:
            return a.name.localeCompare(b.name)
          case SortBy.NAME_DESC:
            return b.name.localeCompare(a.name)
          case SortBy.APY_ASC:
            return (a.apy || 0) - (b.apy || 0)
          case SortBy.APY_DESC:
            return (b.apy || 0) - (a.apy || 0)
          case SortBy.SHARE_ASC:
            return a.stakeShare - b.stakeShare
          case SortBy.SHARE_DESC:
            return b.stakeShare - a.stakeShare
          default:
            return 0
        }
      })
  }, [activeValidators, rollingAverageApys, totalStake, sortBy])

  const onValidatorSelect = (validatorAddress: SuiAddress) => {
    setSearchParams({
      address: validatorAddress,
    })
    setOpen(false)
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="flex flex-col grow font-medium px-6 py-4 overflow-hidden">
        <div className="mb-6 text-xl text-center font-bold relative">
          Validator select
          <span
            className="absolute left-0 top-[7px]"
            onClick={() => setOpen(false)}
          >
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div className="mr-8">Sort by</div>
          <div
            className={cl([
              'flex items-center cursor-pointer hover:opacity-80',
              [SortBy.NAME_ASC, SortBy.NAME_DESC].includes(sortBy) &&
                'text-[#A7D9E3]',
            ])}
            onClick={() =>
              setSortBy(
                sortBy === SortBy.NAME_DESC ? SortBy.NAME_ASC : SortBy.NAME_DESC
              )
            }
          >
            <span>Name</span>
            <ArrowShort
              className={cl([
                '-rotate-90',
                sortBy === SortBy.NAME_ASC && '!rotate-90',
              ])}
              height={8}
              width={12}
            />
          </div>
          <div
            className={cl([
              'flex items-center cursor-pointer hover:opacity-80',
              [SortBy.APY_ASC, SortBy.APY_DESC].includes(sortBy) &&
                'text-[#A7D9E3]',
            ])}
            onClick={() =>
              setSortBy(
                sortBy === SortBy.APY_DESC ? SortBy.APY_ASC : SortBy.APY_DESC
              )
            }
          >
            <span>APY</span>
            <ArrowShort
              className={cl([
                '-rotate-90',
                sortBy === SortBy.APY_ASC && '!rotate-90',
              ])}
              height={8}
              width={12}
            />
          </div>
          <div
            className={cl([
              'flex items-center cursor-pointer hover:opacity-80',
              [SortBy.SHARE_ASC, SortBy.SHARE_DESC].includes(sortBy) &&
                'text-[#A7D9E3]',
            ])}
            onClick={() =>
              setSortBy(
                sortBy === SortBy.SHARE_DESC
                  ? SortBy.SHARE_ASC
                  : SortBy.SHARE_DESC
              )
            }
          >
            <span>Share</span>
            <ArrowShort
              className={cl([
                '-rotate-90',
                sortBy === SortBy.SHARE_ASC && '!rotate-90',
              ])}
              height={8}
              width={12}
            />
          </div>
        </div>
        <div className="grow -mx-6 -mb-6 overflow-hidden">
          <Loading loading={isLoading || apyLoading}>
            <div className="h-full pb-3 overflow-y-auto">
              {validatorList.map((_validator) => (
                <div
                  className="min-h-[48px] flex items-center px-6 cursor-pointer hover:bg-[#fdede5]"
                  onClick={() => onValidatorSelect(_validator.address)}
                  key={_validator.address}
                >
                  <ValidatorLogo
                    iconClassName="!w-8 !h-8"
                    nameClassName="max-w-[180px] truncate"
                    showAddress
                    validatorAddress={_validator.address}
                  />
                  <div className="flex flex-col items-end grow">
                    {[SortBy.APY_ASC, SortBy.APY_DESC].includes(sortBy) && (
                      <span>{_validator.apy}%</span>
                    )}
                    {[SortBy.SHARE_ASC, SortBy.SHARE_DESC].includes(sortBy) && (
                      <span>{_validator.stakeShare}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Loading>
        </div>
      </div>
    </Modal>
  )
}

export default SelectValidatorModal
