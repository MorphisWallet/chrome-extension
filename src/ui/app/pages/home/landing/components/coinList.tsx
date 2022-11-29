import { useMemo } from 'react'

import { Loading, Button } from '_app/components'
import { CoinInfo } from './coinInfo'

import NoCoinPlaceholder from '_assets/icons/no_coin_placeholder.svg'

type CoinListProps = {
  airdropLoading: boolean
  airdropDisabled: boolean
  balanceLoading: boolean
  balances: Record<string, bigint>
  onAirdrop: () => void
}

export const CoinList = ({
  airdropLoading,
  airdropDisabled,
  balanceLoading,
  balances,
  onAirdrop,
}: CoinListProps) => {
  const allCoinTypes = useMemo(() => Object.keys(balances), [balances])

  const renderCoinList = () => {
    if (!allCoinTypes.length) {
      return (
        <div className="flex flex-col grow justify-center items-center px-8">
          <NoCoinPlaceholder height={154} width={234} />
          <p className="font-bold text-base mb-3">Add crypto to get started</p>
          <Button
            loading={airdropLoading}
            disabled={airdropDisabled}
            onClick={onAirdrop}
          >
            Get airdrop
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col grow">
        {allCoinTypes.map((coinType: string) => (
          <CoinInfo
            key={coinType}
            balance={balances[coinType]}
            type={coinType}
          />
        ))}
      </div>
    )
  }

  return <Loading loading={balanceLoading}>{renderCoinList()}</Loading>
}
