import { useMemo } from 'react'
import cl from 'classnames'
import { formatAddress } from '@mysten/sui.js'

import { Loading } from '_app/components'

import { useGetNFTMeta } from '_hooks'
import { useGetDynamicFields } from '_src/ui/core/hooks/useGetDynamicFields'
import { useGetDynamicFieldObject } from '_src/ui/core/hooks/useGetDynamicFieldObject'

type NftCardProps = {
  objectId: string
  imageOnly?: boolean
  className?: string
}

const NftCard = ({ objectId, imageOnly = false, className }: NftCardProps) => {
  const { data: nftMeta, isLoading } = useGetNFTMeta(objectId)
  const { data: dynamicFields } = useGetDynamicFields(nftMeta?.kiosk || '')

  const kioskItem = useMemo(
    () =>
      dynamicFields?.pages?.[0]?.data?.find(
        (_item) => _item?.name?.type === '0x2::kiosk::Item'
      ),
    [dynamicFields]
  )

  const { data: kioskField } = useGetDynamicFieldObject(nftMeta?.kiosk || '', {
    type: kioskItem?.name.type || '',
    value: kioskItem?.name.value,
  })

  const nftName = nftMeta?.name || formatAddress(objectId)
  const nftImageUrl =
    // eslint-disable-next-line
    // @ts-ignore
    nftMeta?.imageUrl || kioskField?.data?.content?.fields?.url || ''

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
