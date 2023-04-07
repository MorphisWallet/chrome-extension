import { Link } from 'react-router-dom'

import Layout from '_app/layouts'
import { Button, IconWrapper } from '_app/components'

import ArrowShort from '_assets/icons/arrow_short.svg'
import ArrowLong from '_assets/icons/arrow_long.svg'

const GeneralPage = () => (
  <Layout>
    <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
      <div className="mb-6 text-xl text-center font-bold relative">
        General
        <Link to="/settings" className="absolute left-0 top-[7px]">
          <IconWrapper>
            <ArrowShort height={10} width={13} />
          </IconWrapper>
        </Link>
      </div>
      <Link to="./wallet-management">
        <Button variant="outlined" className="rounded-[4px] mb-2 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-black">Wallet management</span>
            <ArrowLong />
          </div>
        </Button>
      </Link>
    </div>
  </Layout>
)

export default GeneralPage
