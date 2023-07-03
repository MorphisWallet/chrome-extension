import { useMemo } from 'react'
import { formatAddress } from '@mysten/sui.js'

import { Modal, Loading, IconWrapper, Button } from '_src/ui/app/components'
import { CountDownTimer } from '_src/ui/app/shared/countdown_timer'

import { useGetSystemState } from '_src/ui/core/hooks/useGetSystemState'

import ArrowShort from '_assets/icons/arrow_short.svg'

import type { SuiAddress } from '@mysten/sui.js'

type StakingConfirmModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  validatorAddress: SuiAddress
  stake: string
  apy: number
  timeBeforeStakeRewardsStarts: number
  epoch: string | undefined
  startEarningRewardsEpoch: number
  gas: string
  isSubmitting: boolean
}

const StakingConfirmModal = ({
  open,
  setOpen,
  validatorAddress,
  stake,
  apy,
  timeBeforeStakeRewardsStarts,
  epoch,
  startEarningRewardsEpoch,
  gas,
  isSubmitting,
}: StakingConfirmModalProps) => {
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
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="flex flex-col grow font-medium px-6 py-4">
        <div className="mb-6 text-xl text-center font-bold relative">
          Confirm stake
          <span
            className="absolute left-0 top-[7px]"
            onClick={() => setOpen(false)}
          >
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-6 border-b border-b-[#EFEFEF]">
          <Loading loading={isLoading}>
            <img
              alt={validatorMeta?.name}
              className="h-[32px] w-[32px] mb-4 rounded-full"
              src={validatorMeta?.imageUrl}
            />
            <span className="">{validatorMeta?.name || '-'}</span>
            <span className="text-[#7E7E7E] text-sm">
              {validatorMeta?.suiAddress
                ? formatAddress(validatorMeta.suiAddress)
                : '-'}
            </span>
          </Loading>
        </div>
        <div className="flex flex-col gap-1 py-4">
          <p className="mb-2 flex justify-between">
            <span className="text-[#a0a0a0]">Stake</span>
            <span className="font-bold">{stake}</span>
          </p>
          <p className="mb-2 flex justify-between">
            <span className="text-[#a0a0a0]">Staking APY</span>
            <span className="font-bold">{apy}%</span>
          </p>
          <p className="mb-2 flex justify-between">
            <span className="text-[#a0a0a0]">Staking rewards start</span>
            <span>
              {timeBeforeStakeRewardsStarts > 0 ? (
                <CountDownTimer
                  endLabel="--"
                  label="in"
                  timestamp={timeBeforeStakeRewardsStarts}
                />
              ) : epoch ? (
                `Epoch #${Number(startEarningRewardsEpoch)}`
              ) : (
                '--'
              )}
            </span>
          </p>
          <p className="mb-2 flex justify-between">
            <span className="text-[#a0a0a0]">Gas paid</span>
            <span>{gas}</span>
          </p>
        </div>
        <div className="flex flex-col justify-end grow">
          <Button form="form" loading={isSubmitting} type="submit">
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default StakingConfirmModal
