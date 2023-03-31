import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SUI_TYPE_ARG } from '@mysten/sui.js'

import Layout from '_app/layouts'
import { Button, Loading, toast } from '_app/components'
// import CoinList from './components/coin_list'
import AirdropButton from './components/airdrop_button'

import { useActiveAddress, useGetAllBalances } from '_hooks'
import { useFormatCoin } from '_src/ui/core'

import { GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

const LandingPage = () => {
  const accountAddress = useActiveAddress()
  const { data: balance, isLoading, error } = useGetAllBalances(accountAddress)

  const suiTypeBalance = balance?.find(
    (balance) => balance.coinType === SUI_TYPE_ARG
  )
  const [formatted, symbol] = useFormatCoin(
    suiTypeBalance?.totalBalance,
    suiTypeBalance?.coinType
  )

  useEffect(() => {
    if (error) {
      toast({
        type: 'error',
        message: (error as Error)?.message || 'Failed to load balance',
      })
    }
  }, [error])

  return (
    <Layout>
      <div className="flex flex-col grow font-medium">
        <div className="flex flex-col h-[180px] justify-center items-center py-6 border-b border-b-[#e7e7e9]">
          <div className="text-3xl h-6 mb-6">
            <Loading loading={isLoading}>
              <span>{formatted || 0}</span>
              <span className="text-xl text-[#c0c0c0] ml-2">
                {symbol || 'SUI'}
              </span>
            </Loading>
          </div>
          <div className="flex gap-8 text-sm">
            <AirdropButton />
            <Link
              to={`/send?type=${GAS_TYPE_ARG}`}
              className="flex flex-col items-center"
            >
              <Button
                disabled={isLoading}
                variant="outlined"
                className="!h-[40px] !w-[40px] !px-0 mb-2 rounded-full flex justify-center items-center"
              >
                <ArrowIcon />
              </Button>
              <span>Send</span>
            </Link>
          </div>
        </div>
        {/* <div className="flex grow max-h-[286px] overflow-y-auto">
          <CoinList
            airdropLoading={mutation.isLoading || airdropDelay}
            airdropDisabled={
              !allowAirdrop || mutation.isLoading || loading || airdropDelay
            }
            balanceLoading={loading}
            balances={balances}
            onAirdrop={onAirdrop}
          />
        </div> */}
      </div>
    </Layout>
  )
}

export default LandingPage
