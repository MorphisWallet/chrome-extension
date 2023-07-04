import Layout from '_app/layouts'
import { Banner } from '_app/components'
import Dapps from './components/dapps'

const DiscoveryPage = () => {
  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden">
        <Banner />
        <p className="mb-3 text-xl font-bold">Discovery</p>
        <Dapps />
      </div>
    </Layout>
  )
}

export default DiscoveryPage
