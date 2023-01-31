import cl from 'classnames'

import { useMiddleEllipsis, useNFTBasicData, useOriginbyteNft } from '_hooks'

import type { SuiObject as SuiObjectType } from '@mysten/sui.js'

type NftCardProps = {
  nft: SuiObjectType
  className?: string
}

const NftCard = ({ nft, className }: NftCardProps) => {
  const { filePath, fileExtensionType, objType, nftObjectID } =
    useNFTBasicData(nft)
  const { data: originByteNft } = useOriginbyteNft(nftObjectID)
  const nftTypeShort = useMiddleEllipsis(objType, 20, 3)

  return (
    <div className={cl(['flex grow', className])}>
      {filePath || originByteNft?.fields.url ? (
        <img
          src={originByteNft?.fields.url || filePath || ''}
          alt={fileExtensionType.name || 'NFT'}
          title={nftTypeShort}
          className="w-full"
        />
      ) : (
        <div className="w-full flex justify-center items-center bg-[#eeeeee] text-white text-2xl rounded">
          No media
        </div>
      )}
    </div>
  )
}

export default NftCard
