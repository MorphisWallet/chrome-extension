import cl from 'classnames'
import { formatAddress } from '@mysten/sui.js'

import { Loading } from '_app/components'

import { useGetNFTMeta } from '_hooks'

type NftCardProps = {
  objectId: string
  imageOnly?: boolean
  className?: string
}

const NftCard = ({ objectId, imageOnly = false, className }: NftCardProps) => {
  const { data: nftMeta, isLoading } = useGetNFTMeta(objectId)

  const nftName = nftMeta?.name || formatAddress(objectId)
  const nftImageUrl = nftMeta?.imageUrl || ''

  return (
    <div className={cl(['flex flex-col grow', className])}>
      <Loading loading={isLoading}>
        <>
          <div
            className={cl([
              'w-full flex grow justify-center items-center bg-[#eeeeee] text-white text-2xl rounded overflow-hidden',
            ])}
          >
            {nftImageUrl ? (
              <img
                alt={nftName || ''}
                className={cl([
                  'w-full h-full rounded overflow-hidden',
                  imageOnly && '!h-[308px] !w-full',
                ])}
                src={
                  nftImageUrl?.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/') ||
                  ''
                }
                title={nftName}
              />
            ) : (
              <span>No Image</span>
            )}
          </div>
          {!imageOnly && (
            <p className="font-bold text-center truncate">{nftName}</p>
          )}
        </>
      </Loading>
    </div>
  )
}

export default NftCard
