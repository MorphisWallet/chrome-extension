import { useState } from 'react'
import cl from 'classnames'

import Layout from '_app/layouts'

import FireIcon from '_assets/icons/fire.svg'

enum DiscoveryTabs {
  dApps = 'dApps',
  NFTs = 'NFTs',
}

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
      </div>
    </Layout>
  )
}

export default DiscoveryPage
