import { Link } from 'react-router-dom'

import Layout from '_app/layouts'
import { Button, IconWrapper } from '_app/components'

import ArrowShort from '_assets/icons/arrow_short.svg'
import ArrowLong from '_assets/icons/arrow_long.svg'

const SapPage = () => (
  <Layout>
    <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
      <div className="mb-6 text-xl text-center font-bold relative">
        Security & Privacy
        <Link to="/settings" className="absolute left-0 top-[7px]">
          <IconWrapper>
            <ArrowShort height={10} width={13} />
          </IconWrapper>
        </Link>
      </div>
      <Link to="./change-password">
        <Button variant="outlined" className="rounded-[4px] mb-2 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-black">Change password</span>
            <ArrowLong />
          </div>
        </Button>
      </Link>
      <Link to="./seed-phrase">
        <Button variant="outlined" className="rounded-[4px] mb-2 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-black">Seed phrase</span>
            <ArrowLong />
          </div>
        </Button>
      </Link>
      <Link to="./private-key">
        <Button variant="outlined" className="rounded-[4px] mb-2 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-black">Export private key</span>
            <ArrowLong />
          </div>
        </Button>
      </Link>
    </div>
  </Layout>
)

export default SapPage
