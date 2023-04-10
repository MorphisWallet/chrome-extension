import cl from 'classnames'
import { useQuery } from '@tanstack/react-query'

import { Loading } from '_src/ui/app/components'

import TwitterIcon from '_assets/icons/twitter.svg'
import DiscordIcon from '_assets/icons/discord.svg'

type DiscoveryData = {
  top: DiscoveryItem[]
  list: DiscoveryItem[]
}

type DiscoveryItem = {
  name: string
  image: string
  twitter?: string
  discord?: string
}

const Card = ({ name, twitter, discord, image }: DiscoveryItem) => (
  <div
    className={cl([
      'flex flex-col shrink-0 h-[170px] w-[128px] px-1 py-2 border border-[#f2f2f2] shadow-[0_4px_10px_rgba(184, 184, 184, 0.25)] group',
      'transition hover:scale-105 hover:bg-[#fdede5]',
    ])}
  >
    <div className="h-[118px] rounded overflow-hidden">
      <img alt={name} src={`${process.env.COS_URL}/nfts/${image}`} />
    </div>
    <div className="grow mt-2 font-bold truncate relative">
      <div className="flex justify-center items-center gap-3.5 absolute inset-0 opacity-0 bg-[#fdede5] group-hover:opacity-100 transition">
        {twitter && (
          <a
            href={twitter}
            target="_blank"
            rel="noreferrer"
            className="flex justify-center items-center text-white bg-[#1da1f2] h-6 w-6 rounded-full overflow-hidden transition hover:scale-105"
          >
            <TwitterIcon height={14} width={14} />
          </a>
        )}
        {discord && (
          <a
            href={discord}
            target="_blank"
            rel="noreferrer"
            className="flex justify-center items-center text-white bg-[#1da1f2] h-6 w-6 rounded-full overflow-hidden transition hover:scale-105"
          >
            <DiscordIcon height={14} width={14} />
          </a>
        )}
      </div>
      {name}
    </div>
  </div>
)

const NFTs = () => {
  const { isLoading, data } = useQuery<DiscoveryData>({
    queryKey: ['nftsData'],
    queryFn: () =>
      fetch(`${process.env.COS_URL}/nfts.json`).then((res) => res.json()),
  })

  return (
    <Loading loading={isLoading}>
      <div className="-mx-[24px] overflow-y-auto">
        <div className="shrink-0 overflow-hidden">
          <div className="flex mt-4 px-6 gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar">
            {data?.top?.map((_nft: DiscoveryItem) => (
              <Card key={_nft.name} {..._nft} />
            ))}
          </div>
        </div>
        <div className="flex flex-col grow gap-2 py-1 overflow-y-auto">
          {data?.list?.map(({ name, image, twitter, discord }) => (
            <div
              key={name}
              className="flex items-center px-6 py-2 gap-4 transition hover:bg-[#fbf9f9] hover:shadow-[0_4px_10px_0_rgba(196,196,196,0.25)]"
            >
              <img
                alt={name}
                className="shrink-0 w-[50px] h-[50px] rounded-full"
                src={`${process.env.COS_URL}/nfts/${image}`}
              />
              <span className="grow text-sm font-bold truncate">{name}</span>
              <a
                href={twitter}
                target="_blank"
                rel="noreferrer"
                className="flex justify-center items-center shrink-0 text-white bg-[#1da1f2] h-6 w-6 rounded-full overflow-hidden transition hover:scale-105"
              >
                <TwitterIcon height={14} width={14} />
              </a>
              {discord && (
                <a
                  href={discord}
                  target="_blank"
                  rel="noreferrer"
                  className="flex justify-center items-center shrink-0 text-white bg-[#1da1f2] h-6 w-6 rounded-full overflow-hidden transition hover:scale-105"
                >
                  <DiscordIcon height={14} width={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </Loading>
  )
}

export default NFTs
