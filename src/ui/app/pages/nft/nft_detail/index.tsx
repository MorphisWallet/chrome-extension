import { useEffect } from 'react'
import { Link, Outlet, useParams, useLocation } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import { hasPublicTransfer } from '@mysten/sui.js'

import Layout from '_app/layouts'
import { Loading, IconWrapper, Button, TxLink, toast } from '_app/components'
import NftCard from '../components/nft_card'

import { useActiveAddress, useOwnedNFT, useNFTBasicData } from '_hooks'

import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'

import ArrowShort from '_assets/icons/arrow_short.svg'

const NftDetail = () => {
  const location = useLocation()
  const { objectId: nftId = '' } = useParams()

  const accountAddress = useActiveAddress()
  const {
    data: objectData,
    isLoading,
    isError,
    error,
  } = useOwnedNFT(nftId || '', accountAddress)
  const { nftFields, fileExtensionType, filePath } = useNFTBasicData(objectData)

  const isTransferable = !!objectData && hasPublicTransfer(objectData)

  useEffect(() => {
    if (isError) {
      toast({
        type: 'error',
        message: (error as Error)?.message || 'Failed to load NFT information',
      })
    }
  }, [isError])

  const renderNft = () => {
    if (!objectData) {
      return (
        <div className="flex flex-col grow justify-center items-center text-[#c4c4c4] text-lg">
          <p className="mb-4">NFT Not Found</p>
          <Link to="/nft">
            <Button>Back to NFTs</Button>
          </Link>
        </div>
      )
    }

    const sendFlag = /send$/.test(location.pathname)

    return (
      <div className="flex flex-col grow font-medium px-6 pb-6 overflow-hidden">
        <div className="flex shrink-0 px-6 pt-4 pb-3 mx-[-24px] border-b border-b-[#e6e6e9] text-xl text-center font-bold relative overflow-hidden">
          <span className="grow mx-10 text-center truncate">
            {nftFields?.name || nftFields?.metadata?.fields?.name || '-'}
          </span>
          <Link to="/nft" className="absolute left-6 top-[22px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <div className="flex flex-col grow px-6 pt-4 mx-[-24px] overflow-y-auto">
          <NftCard
            nft={objectData}
            className="h-[308px] shrink-0 mb-2 rounded bg-[#f0f0f0] overflow-hidden"
          />
          {sendFlag ? (
            <Outlet />
          ) : (
            <>
              {nftFields?.description && (
                <p className="shrink-0 text-lg mb-2 truncate">
                  {nftFields.description}
                </p>
              )}
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between w-full text-sm">
                  <span className="text-[#9f9d9d] shrink-0 mr-2">
                    Object ID
                  </span>
                  <TxLink
                    type={ExplorerLinkType.object}
                    objectID={nftId}
                    className="flex shrink text-[#6bb7e9] truncate"
                  >
                    {objectData.objectId}
                  </TxLink>
                </div>
                <div className="flex justify-between w-full text-sm">
                  <span className="text-[#9f9d9d] shrink-0 mr-2">
                    Media type
                  </span>
                  <span className="flex shrink truncate">
                    {filePath &&
                    fileExtensionType?.name &&
                    fileExtensionType?.type
                      ? `${fileExtensionType.name} ${fileExtensionType.type}`
                      : '-'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to="./send" className="w-full">
                  <Button disabled={!isTransferable}>Send</Button>
                </Link>
                <Button
                  data-tip="Coming soon"
                  data-for="button-tip"
                  variant="outlined"
                  className="cursor-not-allowed"
                >
                  Set as wallet PFP
                </Button>
                <ReactTooltip
                  id="button-tip"
                  effect="solid"
                  className="before:hidden"
                  backgroundColor="#000000"
                />
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Layout showNav={false}>
      <Loading loading={isLoading}>{renderNft()}</Loading>
    </Layout>
  )
}

export default NftDetail
