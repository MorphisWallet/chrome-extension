import { useEffect } from 'react'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import cl from 'classnames'

import Layout from '_app/layouts'
import { Loading, IconWrapper, Button, CoinIcon, toast } from '_app/components/'

import { useActiveAddress, useGetCoinBalance } from '_hooks'
import { useFormatCoin } from '_src/ui/core'

import ArrowShort from '_assets/icons/arrow_short.svg'

const CoinDetailPage = () => {
  const [searchParams] = useSearchParams()
  const coinType = searchParams.get('type') || ''

  const accountAddress = useActiveAddress()
  const {
    data: coinBalance,
    isError,
    isLoading,
  } = useGetCoinBalance(coinType, accountAddress)

  const [formatted, symbol] = useFormatCoin(coinBalance?.totalBalance, coinType)

  if (!coinType) {
    return <Navigate to="/" replace={true} />
  }

  // const coinInfo = coinMap[coinType]

  useEffect(() => {
    if (isError) {
      toast({
        type: 'error',
        message: 'Sui server error - failed to load coin balance',
      })
    }
  }, [isError])

  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow">
        <div className="text-center relative px-6 py-2 border-b border-b-[#e6e6e9]">
          <span className="text-[19px] font-bold">{symbol || ''}</span>
          <Link to="../" className="absolute left-[24px] top-[15px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <div className="flex flex-col items-center pt-8 px-6">
          <CoinIcon type={coinType} className="h-[92px] w-[92px] mb-4 text-2xl" iconSize={92} />
          <div className="font-normal text-lg h-7 mb-7">
            <Loading loading={isLoading}>
              <span className="mr-2">{formatted}</span>
              <span className="text-[#c0c0c0]">{symbol}</span>
            </Loading>
          </div>
          <Link
            to={`/send?type=${coinType}`}
            className={cl([
              'w-full',
              (isLoading || !coinBalance?.totalBalance) &&
                'pointer-events-none',
            ])}
          >
            <Button disabled={isLoading}>Send</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default CoinDetailPage
