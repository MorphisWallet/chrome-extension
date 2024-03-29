import { useNavigate, Link } from 'react-router-dom'
import Browser from 'webextension-polyfill'

import Layout from '_app/layouts'
import { Button } from '_app/components'

import { useAppDispatch } from '_hooks'

import { lockWallet } from '_redux/slices/wallet'

import ArrowLong from '_assets/icons/arrow_long.svg'

const SettingsPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onLock = async () => {
    await dispatch(lockWallet()).unwrap()
    navigate('/locked', { replace: true })
  }

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
        <p className="mb-6 text-xl font-bold">Settings</p>
        <Link to="./general">
          <Button variant="outlined" className="rounded-[4px] mb-2 text-[13px]">
            <div className="flex items-center justify-between">
              <span>General</span>
              <ArrowLong />
            </div>
          </Button>
        </Link>
        <Link to="./sap">
          <Button variant="outlined" className="rounded-[4px] mb-2 text-[13px]">
            <div className="flex items-center justify-between">
              <span>Security and Privacy</span>
              <ArrowLong />
            </div>
          </Button>
        </Link>
        <Button
          variant="outlined"
          disabled
          className="rounded-[4px] text-[13px]"
        >
          <div className="flex items-center justify-between">
            <span>
              <span className="text-black">Notifications</span>
              <span className="ml-4 text-[#c4c4c4]">Coming soon</span>
            </span>
            <ArrowLong />
          </div>
        </Button>
        <div className="grow" />
        <Button variant="outlined" onClick={onLock} className="mb-2">
          Log out
        </Button>
        <p className="text-center text-sm text-[#c0c0c0] ">
          Version {Browser.runtime.getManifest().version}
        </p>
      </div>
    </Layout>
  )
}

export default SettingsPage
