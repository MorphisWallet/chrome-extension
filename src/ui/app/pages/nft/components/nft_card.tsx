import { formatAddress } from '@mysten/sui.js'
import cl from 'classnames'

import { Loading } from '_app/components'

import { useGetNFTMeta, useFileExtensionType } from '_hooks'

type NftCardProps = {
  objectId: string
  imageOnly?: boolean
  className?: string
}

const NftCard = ({ objectId, imageOnly = false, className }: NftCardProps) => {
  const { data: nftMeta, isLoading } = useGetNFTMeta(objectId)

  const nftName = nftMeta?.name || formatAddress(objectId)
  const nftImageUrl = nftMeta?.imageUrl || ''
  const fileExtensionType = useFileExtensionType(nftImageUrl)

  return (
    <div className={cl(['h-[169px] flex flex-col grow', className])}>
      <Loading loading={isLoading}>
        <>
          <div className="w-full flex justify-center items-center bg-[#eeeeee] text-white text-2xl rounded overflow-hidden">
            {nftImageUrl ? (
              <img
                alt={nftName || ''}
                className="w-[151px] h-[151px] rounded overflow-hidden"
                height={151}
                src={
                  nftImageUrl?.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/') ||
                  ''
                }
                title={nftName}
                width={151}
              />
            ) : (
              <span>{`${fileExtensionType.name} ${fileExtensionType.type}`}</span>
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
