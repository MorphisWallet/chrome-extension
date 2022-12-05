import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Layout } from '_app/layouts'
import { Button, Loading, toast } from '_app/components'
import CoinList from './components/coin_list'

import {
  useAppSelector,
  useObjectsState,
  useAppDispatch,
  useFormatCoin,
} from '_hooks'

import { requestGas } from '_app/shared/faucet/actions'
import { accountAggregateBalancesSelector } from '_redux/slices/account'
import { GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin'

import { API_ENV } from '_app/ApiProvider'
import { formatFaucetError } from '_app/shared/faucet/utils'
import { POLL_SUI_OBJECTS_INTERVAL } from '_src/shared/constants'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

type LandingProps = {
  coinType?: string
}

const LandingPage = ({ coinType }: LandingProps) => {
  const activeCoinType = coinType || GAS_TYPE_ARG

  const dispatch = useAppDispatch()
  const network = useAppSelector(({ app }) => app.apiEnv)
  const { loading: faucetLoading, lastRequest } = useAppSelector(
    ({ faucet }) => faucet
  )
  const balances = useAppSelector(accountAggregateBalancesSelector)
  const { loading } = useObjectsState()

  const activeCoinBalance = balances[activeCoinType] || BigInt(0)
  const [formattedBalance, symbol] = useFormatCoin(
    activeCoinBalance,
    activeCoinType,
    true
  )
  const [coinsReceivedFormatted, coinsReceivedSymbol] = useFormatCoin(
    lastRequest?.totalGasReceived,
    GAS_TYPE_ARG,
    true
  )

  // to fill the gap between airdrop success and poll query balances
  const [airdropDelay, setAirdropDelay] = useState(false)

  const onAirdrop = async () => {
    setAirdropDelay(true)

    await dispatch(requestGas()).unwrap()

    setTimeout(() => {
      setAirdropDelay(false)
    }, POLL_SUI_OBJECTS_INTERVAL)
  }

  useEffect(() => {
    if (!faucetLoading && !!lastRequest) {
      if (lastRequest?.error) {
        toast({
          type: 'error',
          message: formatFaucetError({
            status: lastRequest.status,
            statusTxt: lastRequest.statusTxt,
            retryAfter: lastRequest.retryAfter,
          }),
          containerId: 'global-toast',
        })
        return
      }

      if (lastRequest.error === false) {
        toast({
          type: 'success',
          message: `${
            lastRequest.totalGasReceived ? `${coinsReceivedFormatted} ` : ''
          }${coinsReceivedSymbol} received`,
          containerId: 'global-toast',
        })
      }
    }
  }, [lastRequest])

  const allowAirdrop = API_ENV.customRPC !== network

  return (
    <Layout>
      <div className="flex flex-col grow font-medium">
        <div className="flex flex-col h-[180px] justify-center items-center py-6 border-b border-b-[#e7e7e9]">
          <div className="text-3xl h-6 mb-6">
            <Loading loading={loading}>
              <span>{formattedBalance}</span>
              <span className="text-xl text-[#c0c0c0] ml-2">{symbol}</span>
            </Loading>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col items-center">
              <Button
                onClick={onAirdrop}
                loading={faucetLoading || airdropDelay}
                disabled={
                  !allowAirdrop || faucetLoading || loading || airdropDelay
                }
                className="h-[40px] w-[40px] px-0 mb-2 rounded-full flex justify-center items-center"
              >
                <ArrowIcon className="rotate-180" />
              </Button>
              <span>Airdrop</span>
            </div>
            <Link
              to={`/send?type=${GAS_TYPE_ARG}`}
              className="flex flex-col items-center"
            >
              <Button
                disabled={loading}
                variant="outlined"
                className="h-[40px] w-[40px] px-0 mb-2 rounded-full flex justify-center items-center"
              >
                <ArrowIcon />
              </Button>
              <span>Send</span>
            </Link>
          </div>
        </div>
        <div className="flex grow max-h-[286px] overflow-y-auto">
          <CoinList
            airdropLoading={faucetLoading || airdropDelay}
            airdropDisabled={
              !allowAirdrop || faucetLoading || loading || airdropDelay
            }
            balanceLoading={loading}
            balances={balances}
            onAirdrop={onAirdrop}
          />
        </div>
      </div>
    </Layout>
  )
}

export default LandingPage
