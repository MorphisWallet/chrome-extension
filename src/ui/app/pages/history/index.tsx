import { useEffect } from 'react'

import Layout from '_app/layouts'
import { Loading, toast } from '_app/components'

import Tx from './components/tx'

import { useQueryTransactionsByAddress } from '_hooks'
import { useActiveAddress } from '_src/ui/app/hooks/useActiveAddress'

import type { SuiTransactionBlockResponse } from '@mysten/sui.js'

const HistoryPage = () => {
  const activeAddress = useActiveAddress()
  const {
    data: txns,
    isLoading,
    error,
    isError,
  } = useQueryTransactionsByAddress(activeAddress)

  useEffect(() => {
    if (isError) {
      toast({
        type: 'error',
        message: (error as Error)?.message || 'Failed to faucet',
      })
    }
  }, [isError])

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden">
        <p className="mb-6 text-xl font-bold">Recent activity</p>
        <div className="flex flex-col grow overflow-y-auto">
          <Loading loading={isLoading}>
            {!!activeAddress &&
              txns?.map((txn: SuiTransactionBlockResponse) => (
                <Tx address={activeAddress} key={txn.digest} txn={txn} />
              ))}
            {!txns?.length && (
              <div className="flex grow justify-center items-center">
                <p className="text-[#c4c4c4]">No recent activities</p>
              </div>
            )}
          </Loading>
        </div>
      </div>
    </Layout>
  )
}

export default HistoryPage
