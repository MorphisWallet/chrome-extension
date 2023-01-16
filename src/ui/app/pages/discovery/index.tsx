import { useState } from 'react'
import cl from 'classnames'

import Layout from '_app/layouts'

import FireIcon from '_assets/icons/fire.svg'
import TwitterIcon from '_assets/icons/twitter.svg'
import DiscordIcon from '_assets/icons/discord.svg'

import Wizardland from '_assets/discovery/Wizardland.jpeg'
import BabyApe from '_assets/discovery/BabyApe.jpeg'
import SuiNerdClub from '_assets/discovery/Sui Nerd club.jpeg'
import Funnybuns from '_assets/discovery/Funnybuns.jpeg'
import Depthos from '_assets/discovery/Depthos.jpeg'
import SupLizards from '_assets/discovery/SupLizards.jpeg'
import SuiDinos from '_assets/discovery/SuiDinos.jpeg'
import Occult from '_assets/discovery/Occult.jpeg'
import Cleo from '_assets/discovery/Cleo.jpeg'
import LavaKongz from '_assets/discovery/Lava Kongz.jpeg'
import Chibikiverse from '_assets/discovery/chibikiverse.jpeg'
import Thuggiez from '_assets/discovery/Thuggiez.jpeg'

enum DiscoveryTabs {
  dApps = 'dApps',
  NFTs = 'NFTs',
}

const TOP_NFTS: Item[] = [
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

const LIST_NFTS: Item[] = [
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
]

type Item = {
  name: string
  image: string
  twitter: string
  discord?: string
}

const Card = ({ name, twitter, discord, image }: Item) => (
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
        <a
          href={twitter}
          target="_blank"
          rel="noreferrer"
          className="flex justify-center items-center text-white bg-[#1da1f2] h-6 w-6 rounded-full overflow-hidden transition hover:scale-105"
        >
          <TwitterIcon height={14} width={14} />
        </a>
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

const DiscoveryPage = () => {
  const [tab, setTab] = useState(DiscoveryTabs.NFTs)

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden">
        <p className="mb-3 text-xl font-bold">Discovery</p>
        <div className="flex border-b border-b-[#e7e9e9] text-base">
          {Object.values(DiscoveryTabs).map((_tab) => (
            <div
              key={_tab}
              onClick={() => setTab(DiscoveryTabs[_tab])}
              className={cl([
                'flex items-center h-9 leading-9 px-4 cursor-pointer',
                _tab === DiscoveryTabs[tab] && 'border-b border-b-black',
              ])}
            >
              {_tab}
              {_tab === DiscoveryTabs.NFTs && <FireIcon className="ml-1" />}
            </div>
          ))}
        </div>
        <div className="shrink-0 overflow-hidden mx-[-24px]">
          <div className="flex mt-4 px-6 gap-2 overflow-x-auto overflow-y-hidden">
            {TOP_NFTS.map((_nft) => (
              <Card key={_nft.name} {..._nft} />
            ))}
          </div>
        </div>
        <div className="flex flex-col grow gap-4 mx-[-24px] mb-[-24px] px-6 py-2 overflow-y-auto">
          {LIST_NFTS.map(({ name, image, twitter, discord }) => (
            <div key={name} className="flex items-center gap-4">
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
      </div>
    </Layout>
  )
}

export default DiscoveryPage
