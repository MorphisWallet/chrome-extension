import cl from 'classnames'

import { Button } from '_src/ui/app/components'

import Clutchy from '_assets/discovery/dapps/clutchy.jpeg'
import Araya from '_assets/discovery/dapps/araya.jpeg'
import SuiNS from '_assets/discovery/dapps/sui_ns.png'
import BlueMove from '_assets/discovery/dapps/blue_move.png'
import Cetus from '_assets/discovery/dapps/cetus.png'
import Ballast from '_assets/discovery/dapps/ballast.jpeg'
import Turbos from '_assets/discovery/dapps/turbos.jpeg'
import SuiSwap from '_assets/discovery/dapps/sui_swap.jpeg'
import Tocen from '_assets/discovery/dapps/tocen.jpeg'
import Trellis from '_assets/discovery/dapps/trellis.jpeg'
import Owlswap from '_assets/discovery/dapps/owlswap.jpeg'
import SuiPad from '_assets/discovery/dapps/sui_pad.jpeg'
import Cosmocadia from '_assets/discovery/dapps/cosmocadia.jpeg'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

type DiscoveryAppItem = {
  name: string
  image: React.ReactElement | string
  link: string
}

const TOP_DAPPS: DiscoveryAppItem[] = [
  {
    name: 'Clutchy',
    image: Clutchy,
    link: 'https://clutchy.io/',
  },
  {
    name: 'Araya Finance',
    image: Araya,
    link: 'https://arayafi.org/',
  },
  {
    name: 'SuiNS',
    image: SuiNS,
    link: 'https://SuiNS.io/',
  },
]

const LIST_DAPPS: DiscoveryAppItem[] = [
  {
    name: 'BlueMove',
    image: BlueMove,
    link: 'https://bluemove.net/',
  },
  {
    name: 'Cetus',
    image: Cetus,
    link: 'https://app.cetus.zone/',
  },
  {
    name: 'Ballast',
    image: Ballast,
    link: 'https://www.ballast.fi/',
  },
  {
    name: 'Turbos',
    image: Turbos,
    link: 'https://www.turbos.finance/',
  },
  {
    name: 'SuiSwap',
    image: SuiSwap,
    link: 'http://suiswap.app',
  },
  {
    name: 'Tocen launchpad',
    image: Tocen,
    link: 'https://dev.tocen.co/',
  },
  {
    name: 'Trellis',
    image: Trellis,
    link: 'https://trellis.fi/',
  },
  {
    name: 'Owlswap',
    image: Owlswap,
    link: 'https://owlswap.finance/',
  },
  {
    name: 'SuiPad',
    image: SuiPad,
    link: 'https://suipad.xyz/',
  },
  {
    name: 'COSMOCADIA',
    image: Cosmocadia,
    link: 'https://www.cosmocadia.io/',
  },
]

const Card = ({ name, image, link }: DiscoveryAppItem) => (
  <a
    href={link}
    target="_blank"
    rel="noreferrer"
    className={cl([
      'flex flex-col shrink-0 h-[170px] w-[128px] px-1 py-2 border border-[#f2f2f2] shadow-[0_4px_10px_rgba(184, 184, 184, 0.25)] cursor-pointer',
      'transition hover:scale-105 hover:bg-[#fdede5]',
    ])}
  >
    <div className="h-[118px] rounded overflow-hidden">
      {typeof image === 'string' ? <img alt={name} src={image} /> : image}
    </div>
    <div className="grow mt-2 font-bold truncate">{name}</div>
  </a>
)

const Dapps = () => (
  <div className="-mx-[24px] -mb-[24px] overflow-y-auto">
    <div className="shrink-0 overflow-hidden">
      <div className="flex mt-4 px-6 gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar">
        {TOP_DAPPS.map((_dapp) => (
          <Card key={_dapp.name} {..._dapp} />
        ))}
      </div>
    </div>
    <div className="flex flex-col grow gap-2 py-1 overflow-y-auto">
      {LIST_DAPPS.map(({ name, image, link }) => (
        <a
          key={name}
          href={link}
          target="_blank"
          rel="noreferrer"
          className="flex items-center px-6 py-2 gap-4 transition hover:bg-[#fbf9f9] hover:shadow-[0_4px_10px_0_rgba(196,196,196,0.25)]"
        >
          {typeof image === 'string' ? (
            <img
              alt={name}
              src={image}
              className="shrink-0 w-[50px] h-[50px] rounded-full"
            />
          ) : (
            image
          )}
          <span className="grow text-sm font-bold truncate">{name}</span>
          <Button className="h-6 w-6 px-0 mb-2 bg-[#1da1f2] rounded-full flex justify-center items-center hover:bg-[#1da1f2] hover:scale-105">
            <ArrowIcon height={10} width={10} />
          </Button>
        </a>
      ))}
    </div>
  </div>
)

export default Dapps
