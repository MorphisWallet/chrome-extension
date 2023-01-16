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
import Depthos from '_assets/discovery/depthos.png'

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
          className="flex justify-center items-center text-white bg-[#1da1f2] h-6 w-6 rounded-full overflow-hidden"
        >
          <TwitterIcon height={14} width={14} />
        </a>
        {discord && (
          <a
            href={discord}
            target="_blank"
            rel="noreferrer"
            className="flex justify-center items-center text-white bg-[#1da1f2] h-6 w-6 rounded-full overflow-hidden"
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
        <div className="overflow-hidden mx-[-24px]">
          <div className="flex mt-4 px-6 gap-2 overflow-x-auto overflow-y-hidden">
            {TOP_NFTS.map((_nft) => (
              <Card key={_nft.name} {..._nft} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default DiscoveryPage
