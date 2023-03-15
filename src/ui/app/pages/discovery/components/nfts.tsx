import cl from 'classnames'

import TwitterIcon from '_assets/icons/twitter.svg'
import DiscordIcon from '_assets/icons/discord.svg'

import Wizardland from '_assets/discovery/wizardland.jpeg'
import BabyApe from '_assets/discovery/baby_ape.jpeg'
import SuiNerdClub from '_assets/discovery/sui_nerd_club.jpeg'
import Funnybuns from '_assets/discovery/funny_buns.jpeg'
import Depthos from '_assets/discovery/depthos.jpeg'
import SupLizards from '_assets/discovery/sup_lizards.jpeg'
import SuiDinos from '_assets/discovery/sui_dinos.jpeg'
import Occult from '_assets/discovery/occult.jpeg'
import Cleo from '_assets/discovery/cleo.jpeg'
import LavaKongz from '_assets/discovery/lava_kongz.jpeg'
import Chibikiverse from '_assets/discovery/chibiki_verse.jpeg'
import Thuggiez from '_assets/discovery/thuggiez.jpeg'
import SuiMo from '_assets/discovery/sui_mo.jpeg'
import ScoreMilk from '_assets/discovery/score_milk.jpeg'
import SuiBunnies from '_assets/discovery/sui_bunnies.jpeg'
import AlphaBears from '_assets/discovery/alpha_bears.jpeg'
import XranilecCars from '_assets/discovery/xranilec_cars.jpeg'
import Gamio from '_assets/discovery/gamio.jpeg'
import Outcasts from '_assets/discovery/outcasts.jpeg'

type DiscoveryItem = {
  name: string
  image: string
  twitter?: string
  discord?: string
}

const TOP_NFTS: DiscoveryItem[] = [
  {
    name: 'Wizard Land',
    twitter: 'https://twitter.com/WizardLandSui',
    image: Wizardland,
  },
  {
    name: 'Baby Apes Society - Sui',
    twitter: 'https://twitter.com/Babyapessociety',
    discord: 'https://discord.gg/babyapessociety',
    image: BabyApe,
  },
  {
    name: 'Sui Nerd Club',
    twitter: 'https://twitter.com/NerrrrrdClub',
    image: SuiNerdClub,
  },
  {
    name: 'funnyybuns 🐰💧🥕',
    twitter: 'https://twitter.com/funnyybuns',
    discord: 'https://discord.gg/funnyybuns',
    image: Funnybuns,
  },
]

const LIST_NFTS: DiscoveryItem[] = [
  {
    name: 'Depthos',
    twitter: 'https://twitter.com/DepthosNFT',
    image: Depthos,
  },
  {
    name: 'SupLizards | SUI',
    twitter: 'https://twitter.com/SupLizardNFT',
    discord: 'https://discord.gg/suplizards',
    image: SupLizards,
  },
  {
    name: 'SUI DinosNFT',
    twitter: 'https://twitter.com/SUIDinosNFT',
    discord: 'https://discord.gg/suidinosnft',
    image: SuiDinos,
  },
  {
    name: 'OccultNFT',
    twitter: 'https://twitter.com/OccultNFT',
    discord: 'https://discord.gg/occultnft',
    image: Occult,
  },
  {
    name: 'Cleo NFTs on sui',
    twitter: 'https://twitter.com/sui_cleo',
    discord: 'https://discord.gg/suicleo',
    image: Cleo,
  },
  {
    name: 'Lava Kongz',
    twitter: 'https://twitter.com/LavaKongz',
    image: LavaKongz,
  },
  {
    name: 'Chibikiverse - Origins',
    twitter: 'https://twitter.com/chibikiverse',
    discord: 'https://discord.gg/WYzZRzhQA3',
    image: Chibikiverse,
  },
  {
    name: 'Thuggiez',
    twitter: 'https://twitter.com/ProjectThuggiez',
    discord: 'https://discord.gg/RRHfu8ErwP',
    image: Thuggiez,
  },
  {
    name: 'SuiMO',
    twitter: 'https://twitter.com/SuiMo_NFT',
    image: SuiMo,
  },
  {
    name: 'Score Milk',
    twitter: 'https://twitter.com/ScoreMilk',
    image: ScoreMilk,
  },
  {
    name: 'Sui Bunnies',
    twitter: 'https://twitter.com/BunniesSui',
    image: SuiBunnies,
  },
  {
    name: 'Alpha Bears',
    twitter: 'https://twitter.com/SuiAlphaBears',
    image: AlphaBears,
  },
  {
    name: 'Xranilec Cars',
    twitter: 'https://twitter.com/Xranilec_Cars',
    image: XranilecCars,
  },
  {
    name: 'Gamio',
    twitter: 'https://twitter.com/GamioNFT',
    image: Gamio,
  },
  {
    name: 'Out Casts',
    twitter: 'https://twitter.com/Outcasts_NFT',
    image: Outcasts,
  },
]

const Card = ({ name, twitter, discord, image }: DiscoveryItem) => (
  <div
    className={cl([
      'flex flex-col shrink-0 h-[170px] w-[128px] px-1 py-2 border border-[#f2f2f2] shadow-[0_4px_10px_rgba(184, 184, 184, 0.25)] group',
      'transition hover:scale-105 hover:bg-[#fdede5]',
    ])}
  >
    <div className="h-[118px] rounded overflow-hidden">
      <img alt={name} src={image} />
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

const NFTs = () => (
  <>
    <div className="shrink-0 overflow-hidden mx-[-24px]">
      <div className="flex mt-4 px-6 gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar">
        {TOP_NFTS.map((_nft) => (
          <Card key={_nft.name} {..._nft} />
        ))}
      </div>
    </div>
    <div className="flex flex-col grow gap-2 mx-[-24px] mb-[-24px] py-1 overflow-y-auto">
      {LIST_NFTS.map(({ name, image, twitter, discord }) => (
        <div
          key={name}
          className="flex items-center px-6 py-2 gap-4 transition hover:bg-[#fbf9f9] hover:shadow-[0_4px_10px_0_rgba(196,196,196,0.25)]"
        >
          <img
            alt={name}
            src={image}
            className="shrink-0 w-[50px] h-[50px] rounded-full"
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
  </>
)

export default NFTs
