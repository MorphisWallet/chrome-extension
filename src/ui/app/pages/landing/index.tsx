import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Layout from '_app/layouts'
import { Button, Loading, toast } from '_app/components'
import CoinList from './components/coin_list'

import { useAppSelector, useObjectsState, useFormatCoin } from '_hooks'

import { accountAggregateBalancesSelector } from '_redux/slices/account'
import { GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin'

import { API_ENV } from '_app/ApiProvider'
import { useFaucetMutation } from '_app/shared/faucet/useFaucetMutation'
import { POLL_SUI_OBJECTS_INTERVAL } from '_src/shared/constants'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

type LandingProps = {
  coinType?: string
}

const LandingPage = ({ coinType }: LandingProps) => {
  const activeCoinType = coinType || GAS_TYPE_ARG

  const network = useAppSelector(({ app }) => app.apiEnv)
  const balances = useAppSelector(accountAggregateBalancesSelector)

  const mutation = useFaucetMutation()
  const { loading, error, showError } = useObjectsState()

  const activeCoinBalance = balances[activeCoinType] || BigInt(0)
  const [formattedBalance, symbol] = useFormatCoin(
    activeCoinBalance,
    activeCoinType,
    true
  )

  // to fill the gap between airdrop success and poll query balances
  const [airdropDelay, setAirdropDelay] = useState(false)

  // state of received airdrop, to call useFormatCoin
  const [totalReceived, setTotalReceived] = useState<null | number>(null)
  const [coinsReceivedFormatted, coinsReceivedSymbol] = useFormatCoin(
    totalReceived,
    GAS_TYPE_ARG
  )

  const onAirdrop = async () => {
    if (!mutation.enabled) return

    setAirdropDelay(true)
    try {
      const totalReceived = await mutation.mutateAsync()
      setTotalReceived(totalReceived)
    } catch (err) {
      // already catched by mutation
    } finally {
      setTimeout(() => {
        setAirdropDelay(false)
      }, POLL_SUI_OBJECTS_INTERVAL)
    }
  }

  useEffect(() => {
    if (totalReceived) {
      toast({
        type: 'success',
        message: `${coinsReceivedFormatted} ${coinsReceivedSymbol} received`,
        containerId: 'global-toast',
      })
      setTotalReceived(null)
    }
  }, [totalReceived])

  useEffect(() => {
    if (mutation.isError && mutation.error) {
      toast({
        type: 'error',
        message: (mutation.error as Error).message || 'Failed to airdrop',
      })
    }
  }, [mutation.isError, mutation.error])

  useEffect(() => {
    if (showError && error) {
      toast({
        type: 'error',
        message: error.message,
      })
    }
  }, [error, showError])

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
                loading={mutation.isLoading || airdropDelay}
                disabled={
                  !allowAirdrop ||
                  mutation.isLoading ||
                  mutation.isMutating ||
                  loading ||
                  airdropDelay
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
            airdropLoading={mutation.isLoading || airdropDelay}
            airdropDisabled={
              !allowAirdrop || mutation.isLoading || loading || airdropDelay
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
