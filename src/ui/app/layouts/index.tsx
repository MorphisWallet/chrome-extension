import { memo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ToastContainer, Slide } from 'react-toastify'
import cl from 'classnames'

import { Button, IconWrapper, Modal, Address, Avatar } from '_app/components'
import Network from './components/network'

import { useAppSelector } from '_hooks'

import {
  activeAccountSelector,
  getAccountSelector,
} from '_redux/slices/account'

import CloseIcon from '_assets/icons/close.svg'
import LandingIcon from '_assets/icons/landing.svg'
import NftIcon from '_assets/icons/nft.svg'
import HistoryIcon from '_assets/icons/history.svg'
import SettingsIcon from '_assets/icons/settings.svg'

type PageLayoutProps = {
  children: React.ReactNode | React.ReactNode[]
  className?: string
  showHeader?: boolean
  showNav?: boolean
}

const ROUTES = [
  {
    name: 'landing',
    icon: LandingIcon,
  },
  {
    name: 'nft',
    icon: NftIcon,
  },
  {
    name: 'history',
    icon: HistoryIcon,
  },
  {
    name: 'settings',
    icon: SettingsIcon,
  },
]

const LayoutBase = ({
  children,
  className,
  showHeader = true,
  showNav = true,
}: PageLayoutProps) => {
  // const dispatch = useAppDispatch()
  const location = useLocation()
  const network = useAppSelector(({ app }) => app.apiEnv)
  const activeAddress = useAppSelector(activeAccountSelector)
  const { avatar } =
    useAppSelector(getAccountSelector(activeAddress || '')) || {}

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col grow relative overflow-hidden">
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Network setModalOpen={setModalOpen} />
      </Modal>
      <ToastContainer
        containerId="global-toast"
        position="top-center"
        autoClose={3000}
        limit={1}
        hideProgressBar
        enableMultiContainer
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="dark"
        closeButton={({ closeToast }) => (
          <IconWrapper onClick={closeToast}>
            <CloseIcon />
          </IconWrapper>
        )}
        transition={Slide}
        className={cl([
          'h-10 !p-0 !top-12 !w-[360px] [&>div]:min-h-[40px] [&>div]:px-6 [&>div]:items-center [&>div]:rounded-none [&>div]:shadow-none !z-50',
          !showHeader && '!top-0 !z-[9999]',
        ])}
      />
      {showHeader && (
        <header className="h-12 px-6 bg-white border-b border-b-[#e6e6e9] flex items-center shrink-0 font-medium z-[1010]">
          <Link to="/settings/wallet-management">
            <Avatar avatar={avatar} size={24} />
          </Link>
          <div className="grow mx-2 text-center cursor-pointer">
            <Address />
          </div>
          <Button
            title={network}
            className="!h-6 !w-auto !rounded-[12px] !text-[10px] !px-2.5 max-w-[60px]"
            onClick={() => setModalOpen(true)}
          >
            {network}
          </Button>
        </header>
      )}
      <main className={cl(['flex flex-col grow overflow-hidden', className])}>
        {children}
      </main>
      {showNav && (
        <nav className="h-14 bg-black flex items-center justify-around shrink-0">
          {ROUTES.map((route) => (
            <Link
              key={route.name}
              to={`/${route.name}`}
              className={cl([
                'w-[52px] h-9 rounded-[20px] flex justify-center items-center transition duration-300 ease-in-out',
                location.pathname.includes(route.name)
                  ? 'text-black bg-white hover:bg-[#dddddd] hover:scale-110'
                  : 'text-white hover:bg-[#333333] hover:scale-110',
              ])}
            >
              {<route.icon height={20} width={20} />}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}

export default memo(LayoutBase)
