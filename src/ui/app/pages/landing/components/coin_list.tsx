import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import cl from 'classnames'
import { Coin } from '@mysten/sui.js'

import { Loading, Button, toast } from '_app/components'
import CoinInfo from './coin_info'

import { useFaucetMutation } from '_src/ui/app/shared/faucet/useFaucetMutation'
import { useAppSelector } from '_hooks'

import { API_ENV } from '_src/shared/api-env'

import NoCoinPlaceholder from '_assets/icons/no_coin_placeholder.svg'
import ChevronRight from '_assets/icons/chevron_right.svg'

import type { CoinBalance } from '@mysten/sui.js'

import COINS from '_app/components/coin_icon/coins.json'

const RECOGNIZED_COINS = COINS.map((coin) => coin.coin_type)

type CoinListProps = {
  balancesLoading: boolean
  balances: CoinBalance[] | undefined
}

const CoinList = ({ balancesLoading, balances }: CoinListProps) => {
  const network = useAppSelector(({ app }) => app.apiEnv)
  const mutation = useFaucetMutation()

  const [collapsed, setCollapsed] = useState(true)

  const allowAirdrop = ![API_ENV.customRPC, API_ENV.mainnet].includes(network)

  useEffect(() => {
    if (mutation.isError) {
      toast({
        type: 'error',
        message: 'Sui server error - failed to faucet',
      })
    }
  }, [mutation.isError])

  const suiBalance = useMemo(
    () =>
      balances?.find(
        (_balance: CoinBalance) => _balance.coinType === '0x2::sui::SUI'
      ),
    [balances]
  )

  const otherBalances = useMemo(
    () =>
      balances
        ?.filter(
          (_balance: CoinBalance) =>
            _balance.coinType !== '0x2::sui::SUI' &&
            RECOGNIZED_COINS.includes(_balance.coinType)
        )
        ?.sort((a, b) =>
          Coin.getCoinSymbol(a.coinType).localeCompare(
            Coin.getCoinSymbol(b.coinType)
          )
        ),
    [balances]
  )

  const unrecognizedBalances = useMemo(
    () =>
      balances
        ?.filter(
          (_balance: CoinBalance) =>
            !RECOGNIZED_COINS.includes(_balance.coinType)
        )
        ?.sort((a, b) =>
          Coin.getCoinSymbol(a.coinType).localeCompare(
            Coin.getCoinSymbol(b.coinType)
          )
        ),
    [balances]
  )

  const renderCoinList = () => {
    if (!balances?.length) {
      return (
        <div className="flex flex-col grow justify-center items-center px-8">
          <NoCoinPlaceholder height={154} width={234} />
          <p className="font-bold text-base mb-3">Add crypto to get started</p>
          {allowAirdrop && (
            <Button
              loading={mutation.isLoading}
              onClick={() => mutation.mutate()}
            >
              Get airdrop
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-col grow">
        {suiBalance && (
          <Link
            key={suiBalance.coinType}
            to={`./details?type=${suiBalance.coinType}`}
          >
            <CoinInfo balance={suiBalance} />
          </Link>
        )}
        {otherBalances?.map((_balance: CoinBalance) => (
          <Link
            key={_balance.coinType}
            to={`./details?type=${_balance.coinType}`}
          >
            <CoinInfo balance={_balance} />
          </Link>
        ))}
        {!!unrecognizedBalances?.length && (
          <div className="flex items-center justify-center">
            <div
              className="flex items-center px-2 py-0.5 rounded-[10px] bg-[#F2FAFF] cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => setCollapsed(!collapsed)}
            >
              <span className="mr-1">
                Unrecognized coin({unrecognizedBalances.length})
              </span>
              <ChevronRight
                className={cl([collapsed ? 'rotate-90' : '-rotate-90'])}
                height={12}
                width={12}
              />
            </div>
          </div>
        )}
        {!collapsed &&
          unrecognizedBalances?.map((_balance: CoinBalance) => (
            <Link
              key={_balance.coinType}
              to={`./details?type=${_balance.coinType}`}
            >
              <CoinInfo balance={_balance} />
            </Link>
          ))}
      </div>
    )
  }

  return <Loading loading={balancesLoading}>{renderCoinList()}</Loading>
}

export default CoinList
