import { useEffect } from 'react'

import { Layout } from '_app/layouts'
import { Loading } from '_app/components'
import { Tx } from './components/tx'

import { useAppSelector, useAppDispatch } from '_hooks'

import { getTransactionsByAddress } from '_redux/slices/txresults'

import type { TxResultState } from '_redux/slices/txresults'

export const History = () => {
  const dispatch = useAppDispatch()
  const { loading, latestTx } = useAppSelector(({ txresults }) => ({
    loading: txresults.loading,
    latestTx: txresults.latestTx,
  }))

  useEffect(() => {
    dispatch(getTransactionsByAddress()).unwrap()
  }, [dispatch])

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden">
        <p className="mb-6 text-xl font-bold">Recent activity</p>
        <div className="flex flex-col grow overflow-y-auto">
          <Loading loading={loading}>
            {latestTx.map((tx: TxResultState) => (
              <Tx key={tx.txId} {...tx} />
            ))}
          </Loading>
        </div>
      </div>
    </Layout>
  )
}
