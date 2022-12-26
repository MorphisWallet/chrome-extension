import { Link, useParams } from 'react-router-dom'

import Layout from '_app/layouts'
import { IconWrapper } from '_app/components'

import ArrowShort from '_assets/icons/arrow_short.svg'

const UpdateWalletMetaPage = () => {
  const { address } = useParams()

  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow shrink-0 font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
        <div className="mb-6 text-xl text-center font-bold relative">
          Wallet Management
          <Link to="/settings/wallet-management" className="absolute left-0 top-[7px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <div>
          <h1>{address}</h1>
        </div>
      </div>
    </Layout>
  )
}

export default UpdateWalletMetaPage
