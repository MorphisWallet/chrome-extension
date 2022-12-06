import { useSearchParams } from 'react-router-dom'

import { Modal, IconWrapper } from '_app/components'
import CoinInfo from '_pages/landing/components/coin_info'

import { useAppSelector } from '_hooks'

import { accountAggregateBalancesSelector } from '_redux/slices/account'

import BackArrow from '_assets/icons/arrow_short.svg'

type SelectCoinModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const SelectCoinModal = ({ open, setOpen }: SelectCoinModalProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const coinType = searchParams.get('type') || ''
  const balances = useAppSelector(accountAggregateBalancesSelector)

  const allCoinTypes = Object.keys(balances)

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
        {allCoinTypes.map((_coinType: string) => (
          <div
            key={_coinType}
            className="cursor-pointer"
            onClick={(e) => handleCoinChange(e, _coinType)}
          >
            <CoinInfo balance={balances[_coinType]} type={_coinType} />
          </div>
        ))}
      </div>
    </Modal>
  )
}
