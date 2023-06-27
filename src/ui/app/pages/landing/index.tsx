import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SUI_TYPE_ARG } from '@mysten/sui.js'
import cl from 'classnames'

import Layout from '_app/layouts'
import { Button, Loading, toast } from '_app/components'
import CoinList from './components/coin_list'
import AirdropButton from './components/airdrop_button'
import StakingButton from './components/staking_button'

import { useActiveAddress, useGetAllBalances, useAppSelector } from '_hooks'
import { useFormatCoin } from '_src/ui/core'

import { API_ENV } from '_src/shared/api-env'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'
import Bridge from '_assets/icons/bridge.svg'

const LandingPage = () => {
  const accountAddress = useActiveAddress()
  const network = useAppSelector(({ app }) => app.apiEnv)
  const {
    data: balances,
    isLoading,
    isError,
    failureCount,
  } = useGetAllBalances(accountAddress)

  const suiTypeBalance = balances?.find(
    (_balance) => _balance.coinType === SUI_TYPE_ARG
  )
  const [formatted, symbol] = useFormatCoin(
    suiTypeBalance?.totalBalance,
    suiTypeBalance?.coinType
  )

  useEffect(() => {
    if (isError && failureCount < 2) {
      toast({
        type: 'error',
        message: 'Sui server error - failed to load balance',
      })
    }
  }, [isError, failureCount])

  return (
    <Layout>
      <div className="flex flex-col grow font-medium">
        <div className="flex flex-col h-[180px] justify-center items-center py-6">
          <div className="text-3xl h-6 mb-6">
            <Loading loading={isLoading}>
              <span>{formatted || 0}</span>
              <span className="text-xl text-[#c0c0c0] ml-2">
                {symbol || 'SUI'}
              </span>
            </Loading>
          </div>
          <div className="flex gap-8 text-sm">
            {network === API_ENV.mainnet ? (
              <Link className="flex flex-col items-center" to="/receive">
                <Button className="!h-[40px] !w-[40px] !px-0 mb-2 rounded-full flex justify-center items-center">
                  <ArrowIcon className="rotate-180" />
                </Button>
                <span>Receive</span>
              </Link>
            ) : (
              <AirdropButton />
            )}
            <Link
              className={cl([
                'flex flex-col items-center',
                (isLoading || !suiTypeBalance?.totalBalance) &&
                  'pointer-events-none',
              ])}
              to={`/send?type=${SUI_TYPE_ARG}`}
            >
              <Button
                className="!h-[40px] !w-[40px] !px-0 mb-2 rounded-full flex justify-center items-center"
                disabled={isLoading || !suiTypeBalance?.totalBalance}
                variant="outlined"
              >
                <ArrowIcon />
              </Button>
              <span>Send</span>
            </Link>
            <a
              className="flex flex-col items-center"
              href="https://www.portalbridge.com/#/transfer"
              rel="noreferrer"
              target="_blank"
            >
              <Button
                className="!h-[40px] !w-[40px] !px-0 mb-2 rounded-full flex justify-center items-center"
                variant="outlined"
              >
                <Bridge height={24} width={24} />
              </Button>
              <span>Bridge</span>
            </a>
          </div>
        </div>
        {accountAddress && <StakingButton address={accountAddress} />}
        <div className="flex grow max-h-[286px] overflow-y-auto">
          <CoinList balancesLoading={isLoading} balances={balances} />
        </div>
      </div>
    </Layout>
  )
}

export default LandingPage
