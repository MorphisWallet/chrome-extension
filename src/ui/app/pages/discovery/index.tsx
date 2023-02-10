import { useState } from 'react'

import Layout from '_app/layouts'
import { Tabs, Tab, Banner } from '_components/index'
import NFTs from './components/nfts'
import Dapps from './components/dapps'

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
        <Banner />
        <p className="mb-3 text-xl font-bold">Discovery</p>
        <Tabs
          value={tab as string}
          onChange={(newValue) => setTab(newValue as DiscoveryTabs)}
          classNames="mx-[-24px]"
        >
          {Object.values(DiscoveryTabs).map((_tab) => (
            <Tab
              key={_tab}
              value={_tab}
              label={
                <div className="flex items-center">
                  {_tab}
                  {_tab === DiscoveryTabs.NFTs && <FireIcon className="ml-1" />}
                </div>
              }
            />
          ))}
        </Tabs>
        {tab === DiscoveryTabs.NFTs && <NFTs />}
        {tab === DiscoveryTabs.dApps && <Dapps />}
      </div>
    </Layout>
  )
}

export default DiscoveryPage
