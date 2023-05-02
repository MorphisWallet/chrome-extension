import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'
import { SUI_TYPE_ARG } from '@mysten/sui.js'
import cl from 'classnames'

import Layout from '_app/layouts'
import { Button, Loading, toast } from '_app/components'
import CoinList from './components/coin_list'
import AirdropButton from './components/airdrop_button'

import { useActiveAddress, useGetAllBalances, useAppSelector } from '_hooks'
import { useFormatCoin } from '_src/ui/core'

import { API_ENV } from '_src/shared/api-env'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

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
            {network === API_ENV.mainnet ? (
              <Link
                className="flex flex-col items-center cursor-not-allowed"
                data-tooltip-content="Coming soon"
                data-tooltip-id="link-tip"
                to="/"
              >
                <Button className="!h-[40px] !w-[40px] !px-0 mb-2 rounded-full flex justify-center items-center !cursor-not-allowed">
                  <ArrowIcon className="rotate-180" />
                </Button>
                <span>Receive</span>
                <Tooltip id="link-tip" />
              </Link>
            ) : (
              <AirdropButton />
            )}
            <Link
              to={`/send?type=${SUI_TYPE_ARG}`}
              className={cl([
                'flex flex-col items-center',
                (isLoading || !suiTypeBalance?.totalBalance) &&
                  'pointer-events-none',
              ])}
            >
              <Button
                disabled={isLoading || !suiTypeBalance?.totalBalance}
                variant="outlined"
                className="!h-[40px] !w-[40px] !px-0 mb-2 rounded-full flex justify-center items-center"
              >
                <ArrowIcon />
              </Button>
              <span>Send</span>
            </Link>
          </div>
        </div>
        <div className="flex grow max-h-[286px] overflow-y-auto">
          <CoinList balancesLoading={isLoading} balances={balances} />
        </div>
      </div>
    </Layout>
  )
}

export default LandingPage
