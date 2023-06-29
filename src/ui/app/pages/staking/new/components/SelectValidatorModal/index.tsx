import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

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

const SelectValidatorModal = ({ open, setOpen }: SelectValidatorModalProps) => {
  const [, setSearchParams] = useSearchParams()

  const { data, isLoading } = useGetSystemState()
  const { data: rollingAverageApys, isLoading: apyLoading } =
    useGetValidatorsApy()

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
    return activeValidators.map((validator) => {
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
  }, [activeValidators, rollingAverageApys, totalStake])

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
        <div className="grow -mx-6 overflow-hidden">
          <Loading loading={isLoading || apyLoading}>
            <div className="h-full overflow-y-auto">
              {validatorList.map((_validator) => (
                <div
                  className="min-h-[48px] flex items-center px-6 cursor-pointer hover:bg-[#fdede5]"
                  onClick={() => onValidatorSelect(_validator.address)}
                  key={_validator.address}
                >
                  <ValidatorLogo
                    iconClassName="!w-[32px] !h-[32px]"
                    showAddress
                    validatorAddress={_validator.address}
                  />
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
