import { Link } from 'react-router-dom'

import Layout from '_app/layouts'
import { IconWrapper } from '_app/components'

import ArrowShort from '_assets/icons/arrow_short.svg'

const WalletManagementPage = () => {
  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
        <div className="mb-6 text-xl text-center font-bold relative">
          Wallet Management
          <Link to="/" className="absolute left-0 top-[7px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default WalletManagementPage
