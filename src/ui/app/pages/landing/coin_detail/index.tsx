import { Navigate, Link, useSearchParams } from 'react-router-dom'

import Layout from '_app/layouts'
import { Loading, IconWrapper, Button, CoinIcon } from '_app/components/'

import { useAppSelector, useFormatCoin, useObjectsState } from '_hooks'

import { accountAggregateBalancesSelector } from '_redux/slices/account'

import { coinMap } from '_app/utils/coin'

import ArrowShort from '_assets/icons/arrow_short.svg'

const CoinDetailPage = () => {
  const [searchParams] = useSearchParams()
  const coinType = searchParams.get('type')

  const balances = useAppSelector(accountAggregateBalancesSelector)
  const tokenBalance = coinType ? balances[coinType] || BigInt(0) : 0

  const [formatted, symbol] = useFormatCoin(tokenBalance, coinType, true)
  const { loading } = useObjectsState()

  if (!coinType) {
    return <Navigate to="/" replace={true} />
  }

  const coinInfo = coinMap[coinType]

  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow">
        <div className="text-center relative px-6 py-2 border-b border-b-[#e6e6e9]">
          <span className="text-[19px] font-bold">
            {coinInfo?.name || symbol || ''}
          </span>
          <Link to="../" className="absolute left-[24px] top-[15px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <div className="flex flex-col items-center pt-8 px-6">
          <CoinIcon type={coinType} className="h-[92px] w-[92px] mb-4" />
          <div className="font-normal text-lg h-7 mb-7">
            <Loading loading={loading}>
              <span className="mr-2">{formatted}</span>
              <span className="text-[#c0c0c0]">{symbol}</span>
            </Loading>
          </div>
          <Link to={`/send?type=${coinType}`} className="w-full">
            <Button disabled={loading || !coinInfo}>Send</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default CoinDetailPage
