import { useNavigate, useSearchParams } from 'react-router-dom'

import Layout from '_app/layouts'
import { Button, IconWrapper } from '_app/components'

import { useActiveAddress } from '_src/ui/app/hooks'
import { useSigner } from '_src/ui/app/hooks'

import ArrowShort from '_assets/icons/arrow_short.svg'
import ValidatorLogo from '../components/validator_logo'

const Unstake = () => {
  const [searchParams] = useSearchParams()
  const validatorAddress = searchParams.get('validator')
  const stakeId = searchParams.get('staked')
  const navigate = useNavigate()

  const accountAddress = useActiveAddress()
  const signer = useSigner()

  return (
    <Layout showHeader={false} showNav={false}>
      <div className="relative flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
        <div className="mb-6 text-xl text-center font-bold relative">
          Unstake SUI
          <span
            className="absolute left-0 top-[7px]"
            onClick={() => navigate('/staking')}
          >
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </span>
        </div>
        <div className="flex flex-col px-6 pb-6 mx-[-24px] border-b border-b-[#EFEFEF]"></div>
        <Button type="button">Stake</Button>
      </div>
    </Layout>
  )
}

export default Unstake
