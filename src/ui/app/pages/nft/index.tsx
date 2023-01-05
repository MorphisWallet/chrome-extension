import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import Layout from '_app/layouts'
import { Loading, toast } from '_app/components'
import NftCard from './components/nft_card'

import { useAppSelector, useObjectsState } from '_hooks'
import { accountNftsSelector } from '_redux/slices/account'

const NftPage = () => {
  const nfts = useAppSelector(accountNftsSelector)
  const { error, loading, showError } = useObjectsState()

  useEffect(() => {
    if (showError && error) {
      toast({
        type: 'error',
        message: error.message,
      })
    }
  }, [error, showError])

  const renderNfts = () => {
    if (!nfts?.length) {
      return (
        <div className="flex grow justify-center items-center text-[#c4c4c4] text-lg">
          No NFTs
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 mx-[-24px] mb-[-24px] px-6 pt-2.5 pb-6 overflow-y-auto">
        {nfts.map((nft) => (
          <Link
            to={`./${nft.reference.objectId}`}
            key={nft.reference.objectId}
            className="flex h-[152px] rounded bg-[#f0f0f0] overflow-hidden transition-transform duration-100 ease-in-out hover:scale-105"
          >
            <NftCard nft={nft} />
          </Link>
        ))}
      </div>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden">
        <p className="shrink-0 mb-2 text-xl font-bold">Collectibles</p>
        <Loading loading={loading}>{renderNfts()}</Loading>
      </div>
    </Layout>
  )
}

export default NftPage
