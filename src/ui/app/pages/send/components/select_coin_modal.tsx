import { useSearchParams } from 'react-router-dom'

import { Modal, IconWrapper } from '_app/components'
import CoinInfo from '_pages/landing/components/coin_info'

import { useActiveAddress, useGetAllBalances } from '_hooks'

import BackArrow from '_assets/icons/arrow_short.svg'

import type { CoinBalance } from '@mysten/sui.js'

type SelectCoinModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const SelectCoinModal = ({ open, setOpen }: SelectCoinModalProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const coinType = searchParams.get('type') || ''

  const accountAddress = useActiveAddress()
  const { data: balances } = useGetAllBalances(accountAddress)

  const handleCoinChange = (
    e: React.SyntheticEvent,
    selectedCoinType: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (selectedCoinType === coinType) {
      setOpen(false)
      return
    }

    setSearchParams(
      new URLSearchParams({
        ...setSearchParams,
        type: selectedCoinType,
      }).toString(),
      { replace: true }
    )
    setOpen(false)
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="h-12 px-6 flex justify-center items-center relative border-b border-b-[#e6e6e9]">
        <IconWrapper onClick={() => setOpen(false)} className="absolute left-6">
          <BackArrow />
        </IconWrapper>
        <span className="text-xl font-bold">Select coin</span>
      </div>
      <div className="flex flex-col grow">
        {balances?.map((_coinBalance: CoinBalance) => (
          <div
            key={_coinBalance.coinType}
            className="cursor-pointer"
            onClick={(e) => handleCoinChange(e, _coinBalance.coinType)}
          >
            <CoinInfo balance={_coinBalance} />
          </div>
        ))}
      </div>
    </Modal>
  )
}
