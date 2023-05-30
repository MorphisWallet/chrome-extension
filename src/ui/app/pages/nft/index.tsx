import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import Layout from '_app/layouts'
import { Loading, toast } from '_app/components'
import NftCard from './components/nft_card'

import { useActiveAddress } from '_hooks'
import { useGetNFTs } from '../../hooks/useGetNFTs'

const NftPage = () => {
  const accountAddress = useActiveAddress()
  const { data: nfts, error, isLoading, isError } = useGetNFTs(accountAddress)

  useEffect(() => {
    if (isError) {
      toast({
        type: 'error',
        message:
          (error as Error)?.message || 'Sui server error - Failed to load NFTs',
      })
    }
  }, [isError])

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
        {nfts.map((_nft) => (
          <Link
            className="flex transition-transform duration-100 ease-in-out hover:scale-[1.01]"
            key={_nft.objectId}
            to={`./${_nft.objectId}`}
          >
            <NftCard className="min-h-[169px]" objectId={_nft.objectId} />
          </Link>
        ))}
      </div>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden">
        <p className="shrink-0 mb-2 text-xl font-bold">Collectibles</p>
        <Loading loading={isLoading}>{renderNfts()}</Loading>
      </div>
    </Layout>
  )
}

export default NftPage
