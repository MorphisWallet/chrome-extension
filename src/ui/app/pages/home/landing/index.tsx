import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { Layout } from '_app/layouts'
import { Button, Loading, Alert } from '_app/components'
import { CoinList } from './components/coinList'

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
import { POLL_SUI_OBJECTS_INTERVAL } from '_src/shared/constants'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

type LandingProps = {
  coinType?: string
}

export const Landing = ({ coinType }: LandingProps) => {
  const activeCoinType = coinType || GAS_TYPE_ARG

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const network = useAppSelector(({ app }) => app.apiEnv)
  const faucetLoading = useAppSelector(({ faucet }) => faucet.loading)
  const balances = useAppSelector(accountAggregateBalancesSelector)
  const { loading, error, showError } = useObjectsState()

  const activeCoinBalance = balances[activeCoinType] || BigInt(0)
  const [formattedBalance, symbol] = useFormatCoin(
    activeCoinBalance,
    activeCoinType,
    true
  )

  // to fill the gap between airdrop success and poll query balances
  const [airdropDelay, setAirdropDelay] = useState(false)

  const onAirdrop = async () => {
    setAirdropDelay(true)
    try {
      const res = await dispatch(requestGas()).unwrap()

      toast(<Alert type="success">{`Received ${res.total} SUI`}</Alert>, {
        toastId: 'global-toast',
      })
    } catch (error: unknown) {
      console.error(error)

      const _error = error as {
        status: number
        statusTxt: string | undefined
        retryAfter: number
      }
      if (_error.status === 429) {
        toast(
          <Alert type="error">{`Reach the limit, please retry after ${Math.round(
            _error.retryAfter / 60
          )} minute(s)`}</Alert>,
          {
            toastId: 'global-toast',
          }
        )
      }
    } finally {
      setTimeout(() => {
        setAirdropDelay(false)
      }, POLL_SUI_OBJECTS_INTERVAL)
    }
  }

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
            <div className="flex flex-col items-center">
              <Button
                disabled={loading}
                variant="outlined"
                className="h-[40px] w-[40px] px-0 mb-2 rounded-full flex justify-center items-center"
              >
                <ArrowIcon />
              </Button>
              <span>Send</span>
            </div>
          </div>
        </div>
        <div className="flex grow px-8">
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
