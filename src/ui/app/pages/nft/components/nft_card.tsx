import { formatAddress } from '@mysten/sui.js'
import cl from 'classnames'

import { Loading } from '_app/components'

import { useGetNFTMeta, useFileExtensionType } from '_hooks'

import type { SuiObjectData } from '@mysten/sui.js'

type NftCardProps = {
  nft: SuiObjectData
  className?: string
}

const NftCard = ({ nft, className }: NftCardProps) => {
  const { data: nftMeta, isLoading } = useGetNFTMeta(nft.objectId)

  const nftName = nftMeta?.name || formatAddress(nft.objectId)
  const nftImageUrl = nftMeta?.imageUrl || ''
  const fileExtensionType = useFileExtensionType(nftImageUrl)

  return (
    <div className={cl(['flex grow', className])}>
      <Loading loading={isLoading}>
        {nftImageUrl ? (
          <img
            src={
              nftImageUrl?.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/') || ''
            }
            alt={nftName || ''}
            title={nftName}
            className="w-full"
          />
        ) : (
          <div className="w-full flex justify-center items-center bg-[#eeeeee] text-white text-2xl rounded">
            {`${fileExtensionType.name} ${fileExtensionType.type}`}
          </div>
        )}
      </Loading>
    </div>
  )
}

export default NftCard
