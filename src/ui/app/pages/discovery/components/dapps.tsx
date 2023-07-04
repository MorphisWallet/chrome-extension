import cl from 'classnames'
import { useQuery } from '@tanstack/react-query'

import { Button, Loading } from '_src/ui/app/components'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

type DAppsData = {
  top: DiscoveryAppItem[]
  list: DiscoveryAppItem[]
}

type DiscoveryAppItem = {
  name: string
  image: React.ReactElement | string
  link: string
}

const Card = ({ name, image, link }: DiscoveryAppItem) => (
  <a
    href={link}
    target="_blank"
    rel="noreferrer"
    className={cl([
      'flex flex-col shrink-0 h-[170px] w-[128px] px-1 pt-2 border border-[#f2f2f2] shadow-[0_4px_10px_rgba(184, 184, 184, 0.25)] cursor-pointer',
      'transition hover:scale-105 hover:bg-[#fdede5]',
    ])}
  >
    <div className="h-[118px] rounded overflow-hidden">
      <img
        alt={name}
        className="shrink-0 w-full h-full"
        src={`${process.env.COS_URL}/dapps/${image}`}
      />
    </div>
    <div className="grow font-bold leading-[42px] truncate">{name}</div>
  </a>
)

const Dapps = () => {
  const { isLoading, data } = useQuery<DAppsData>({
    queryKey: ['dappsData'],
    queryFn: () =>
      fetch(`${process.env.COS_URL}/dapps.json`).then((res) => res.json()),
  })

  return (
    <Loading loading={isLoading}>
      <div className="-mx-[24px] -mb-[24px] overflow-y-auto">
        <div className="shrink-0 overflow-hidden">
          <div className="flex mt-4 px-6 gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar">
            {data?.top?.map((_dapp) => (
              <Card key={_dapp.name} {..._dapp} />
            ))}
          </div>
        </div>
        <div className="flex flex-col grow gap-2 py-1 overflow-y-auto">
          {data?.list?.map(({ name, image, link }) => (
            <a
              key={name}
              href={link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center px-6 py-2 gap-4 transition hover:bg-[#fbf9f9] hover:shadow-[0_4px_10px_0_rgba(196,196,196,0.25)]"
            >
              <img
                alt={name}
                className="shrink-0 w-[50px] h-[50px] rounded-full"
                src={`${process.env.COS_URL}/dapps/${image}`}
              />
              <span className="grow text-sm font-bold truncate">{name}</span>
              <Button className="!h-6 !w-6 !px-0 mb-2 !bg-[#1da1f2] rounded-full flex justify-center items-center hover:bg-[#1da1f2] hover:scale-105">
                <ArrowIcon height={10} width={10} />
              </Button>
            </a>
          ))}
        </div>
      </div>
    </Loading>
  )
}

export default Dapps
