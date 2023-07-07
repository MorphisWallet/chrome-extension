import { useEffect } from 'react'
import { Link, Outlet, useParams, useLocation } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'
import cl from 'classnames'
import { Disclosure } from '@headlessui/react'
import { hasPublicTransfer, formatAddress } from '@mysten/sui.js'

import Layout from '_app/layouts'
import { Loading, IconWrapper, Button, TxLink, toast } from '_app/components'
import NftCard from '../components/nft_card'

import {
  useActiveAddress,
  useOwnedNFT,
  useNFTBasicData,
  useGetNFTMeta,
} from '_hooks'
import { useGetKioskContents } from '_src/ui/core/hooks/useGetKioskContents'

import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'

import ArrowShort from '_assets/icons/arrow_short.svg'
import ChevronRight from '_assets/icons/chevron_right.svg'

const NftDetail = () => {
  const location = useLocation()
  const { objectId = '' } = useParams()

  const accountAddress = useActiveAddress()
  const {
    data: objectData,
    isLoading,
    isError,
    error,
  } = useOwnedNFT(objectId || '', accountAddress)
  const { data: kiosk } = useGetKioskContents(accountAddress)

  const isTransferable = !!objectData && hasPublicTransfer(objectData)
  const { nftFields, fileExtensionType, filePath } = useNFTBasicData(objectData)

  // Extract either the attributes, or use the top-level NFT fields:
  const metaFields =
    nftFields?.metadata?.fields?.attributes?.fields ||
    Object.entries(nftFields ?? {})
      .filter(([key]) => key !== 'id')
      .reduce(
        (acc, [key, value]) => {
          acc.keys.push(key)
          acc.values.push(value)
          return acc
        },
        { keys: [] as string[], values: [] as string[] }
      )
  const metaKeys: string[] = metaFields ? metaFields.keys : []
  const metaValues = metaFields ? metaFields.values : []

  const { data: nftDisplayData, isLoading: isLoadingDisplay } = useGetNFTMeta(
    objectId || ''
  )

  useEffect(() => {
    if (isError) {
      toast({
        type: 'error',
        message:
          (error as Error)?.message ||
          'Sui server error - Failed to load NFT information',
      })
    }
  }, [isError])

  const isContainedInKiosk = kiosk?.kiosks.sui.some(
    (kioskItem) => kioskItem.data?.objectId === objectId
  )

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
        <div className="flex shrink-0 px-6 pt-4 pb-3 -mx-6 border-b border-b-[#e6e6e9] text-xl text-center font-bold relative overflow-hidden">
          <span className="grow mx-10 text-center truncate">
            {nftFields?.name || nftFields?.metadata?.fields?.name || '-'}
          </span>
          <Link to="/nft" className="absolute left-6 top-[22px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <div className="flex flex-col grow px-6 py-4 -mx-6 -mb-6 overflow-y-auto">
          <NftCard
            className="h-[308px] max-h-[308px] shrink-0 mb-2 rounded bg-[#f0f0f0] overflow-hidden"
            imageOnly
            objectId={objectId}
          />
          {sendFlag ? (
            <Outlet />
          ) : (
            <Loading loading={isLoadingDisplay}>
              <p className="shrink-0 text-lg mb-2">
                {nftDisplayData?.description || (
                  <span className="text-[#6bb7e9]">No description</span>
                )}
              </p>
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between w-full text-sm">
                  <span className="text-[#9f9d9d] shrink-0 mr-2">
                    Object ID
                  </span>
                  <TxLink
                    className="flex shrink text-[#6bb7e9] truncate"
                    objectID={objectId}
                    type={ExplorerLinkType.object}
                  >
                    <span title={objectId}>{formatAddress(objectId)}</span>
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
              <div className="mb-2">
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full justify-between py-2 text-left text-sm font-medium rounded-lg transition-colors hover:text-gray-500">
                        <p className="grow flex justify-between items-center">
                          <span>Attributes</span>
                          <ChevronRight
                            className={cl([open ? '-rotate-90' : 'rotate-90'])}
                            height={12}
                            width={12}
                          />
                        </p>
                      </Disclosure.Button>
                      <Disclosure.Panel className="pb-2 text-sm text-gray-500">
                        {metaKeys.map((_key, i) => (
                          <p className="flex" key={_key}>
                            <span className="w-1/2 truncate">{_key}</span>
                            <span className="w-1/2 overflow-x-auto">
                              {typeof metaValues[i] === 'object'
                                ? JSON.stringify(metaValues[i])
                                : metaValues[i]}
                            </span>
                          </p>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  to="./send"
                  className={cl([
                    'w-full',
                    !isTransferable ||
                      (isContainedInKiosk &&
                        'pointer-events-none cursor-not-allowed'),
                  ])}
                >
                  <Button disabled={!isTransferable || isContainedInKiosk}>
                    Send
                  </Button>
                </Link>
                <Button
                  data-tooltip-content="Coming soon"
                  data-tooltip-id="button-tip"
                  variant="outlined"
                  className="cursor-not-allowed"
                >
                  Set as wallet PFP
                </Button>
                <Tooltip id="button-tip" className="before:hidden" />
              </div>
              {isContainedInKiosk && (
                <a
                  className="w-full mt-2"
                  href="https://docs.sui.io/build/sui-kiosk"
                  rel="noreferrer"
                  target="_blank"
                >
                  <Button className="w-full">Learn more about Kiosks</Button>
                </a>
              )}
            </Loading>
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
