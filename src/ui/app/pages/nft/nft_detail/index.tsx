import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import Layout from '_app/layouts'
import { Loading, IconWrapper, Button, TxLink, toast } from '_app/components'
import NftCard from '../components/nft_card'

import {
  useAppSelector,
  useMiddleEllipsis,
  useNFTBasicData,
  useObjectsState,
} from '_hooks'

import { createAccountNftByIdSelector } from '_redux/slices/account'

import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'

import ArrowShort from '_assets/icons/arrow_short.svg'

const NftDetail = () => {
  const { objectId: nftId = '' } = useParams()
  const selectedNft = useAppSelector(createAccountNftByIdSelector(nftId))
  const { nftFields, fileExtensionType, filePath } =
    useNFTBasicData(selectedNft)
  const { loading, error, showError } = useObjectsState()
  const shortAddress = useMiddleEllipsis(nftId)

  useEffect(() => {
    if (showError && error) {
      toast({
        type: 'error',
        message: error.message,
      })
    }
  }, [error, showError])

  const renderNft = () => {
    if (!selectedNft) {
      return (
        <div className="flex flex-col grow justify-center items-center text-[#c4c4c4] text-lg">
          <p className="mb-4">NFT Not Found</p>
          <Link to="/nft">
            <Button>Back to NFTs</Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="flex flex-col grow font-medium px-6 pb-6 overflow-hidden">
        <div className="flex shrink-0 px-6 pt-4 pb-3 mx-[-24px] border-b border-b-[#e6e6e9] text-xl text-center font-bold relative overflow-hidden">
          <span className="grow mx-10 text-center truncate">
            {nftFields?.name ||
              nftFields?.metadata?.fields?.name ||
              shortAddress}
          </span>
          <Link to="/nft" className="absolute left-6 top-[22px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <div className="flex flex-col grow py-4 px-6 mx-[-24px] overflow-y-auto">
          <NftCard
            nft={selectedNft}
            className="h-[308px] shrink-0 mb-2 rounded bg-[#f0f0f0] overflow-hidden"
          />
          {nftFields?.description && (
            <p className="shrink-0 text-lg mb-2 truncate">
              {nftFields.description}
            </p>
          )}
          <div className="flex justify-between w-full text-sm mb-1">
            <span className="text-[#9f9d9d] shrink-0 mr-2">Object ID</span>
            <TxLink
              type={ExplorerLinkType.object}
              objectID={nftId}
              className="flex shrink text-[#6bb7e9] truncate"
            >
              {shortAddress}
            </TxLink>
          </div>
          <div className="flex justify-between w-full text-sm mb-1">
            <span className="text-[#9f9d9d] shrink-0 mr-2">Media type</span>
            <span className="flex shrink truncate">
              {filePath && fileExtensionType?.name && fileExtensionType?.type
                ? `${fileExtensionType.name} ${fileExtensionType.type}`
                : '-'}
            </span>
          </div>
        </div>
        <Link to="/" className="shrink-0">
          <Button>Send</Button>
        </Link>
      </div>
    )
  }

  return (
    <Layout showNav={false}>
      <Loading loading={loading}>{renderNft()}</Loading>
    </Layout>
  )
}

export default NftDetail
