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
      <Button
        variant="outlined"
        disabled
        className="rounded-[4px] mb-2 text-[13px]"
      >
        <div className="flex items-center justify-between">
          <span>
            <span className="text-black">Change password</span>
            <span className="ml-4 text-[#c4c4c4]">Coming soon</span>
          </span>
          <ArrowLong />
        </div>
      </Button>
      <Button
        variant="outlined"
        disabled
        className="rounded-[4px] mb-2 text-[13px]"
      >
        <div className="flex items-center justify-between">
          <span>
            <span className="text-black">Seed phrase</span>
            <span className="ml-4 text-[#c4c4c4]">Coming soon</span>
          </span>
          <ArrowLong />
        </div>
      </Button>
      <Button
        variant="outlined"
        disabled
        className="rounded-[4px] mb-2 text-[13px]"
      >
        <div className="flex items-center justify-between">
          <span>
            <span className="text-black">Export private key</span>
            <span className="ml-4 text-[#c4c4c4]">Coming soon</span>
          </span>
          <ArrowLong />
        </div>
      </Button>
    </div>
  </Layout>
)

export default SapPage
