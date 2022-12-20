import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'

import Layout from '_app/layouts'
import { IconWrapper, Button } from '_app/components'

import { useAppSelector, useMiddleEllipsis } from '_hooks'

import ArrowShort from '_assets/icons/arrow_short.svg'
import ImportIcon from '_assets/icons/import.svg'
import SettingsIcon from '_assets/icons/settings.svg'
import Logo from '_assets/icons/logo.svg'

const WalletManagementPage = () => {
  const { address, alias } = useAppSelector(
    ({ account: { address, alias } }) => ({
      address,
      alias,
    })
  )
  const shortenAddress = useMiddleEllipsis(address, 10, 7)

  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow shrink-0 font-medium px-6 pt-4 pb-6 overflow-hidden">
        <div className="mb-6 text-xl text-center font-bold relative">
          Wallet Management
          <Link to="/" className="absolute left-0 top-[7px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <div className="flex flex-col grow">
          <div className="flex flex-col gap-2 overflow-y-auto">
            <Button
              variant="outlined"
              className="flex items-center h-[60px] px-4 rounded border border-[#7db4ff] cursor-pointer"
            >
              <div className="mr-2">
                <Logo height={16} width={16} />
              </div>
              <div className="flex flex-col grow items-start">
                <div>{alias || 'Account'}</div>
                <div className="text-[#c0c0c0]">{shortenAddress}</div>
              </div>
              <SettingsIcon
                height={19}
                width={18}
                className="transition duration-100 ease-in-out hover:scale-110"
              />
            </Button>
          </div>
          <hr className="my-6 border-black" />
          <Button
            data-tip="Coming soon"
            data-for="button-tip"
            variant="outlined"
            className="flex justify-center items-center rounded-[4px] cursor-not-allowed"
          >
            <ImportIcon height={13} width={9} className="mr-3" />
            Import an existing wallet
          </Button>
          <ReactTooltip
            id="button-tip"
            effect="solid"
            className="before:hidden"
            backgroundColor="#000000"
          />
        </div>
      </div>
    </Layout>
  )
}

export default WalletManagementPage
