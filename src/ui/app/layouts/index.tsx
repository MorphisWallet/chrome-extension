import { memo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ToastContainer, Slide, toast } from 'react-toastify'
import cl from 'classnames'
import copy from 'copy-to-clipboard'

import { Button, IconWrapper, Alert, Modal } from '_app/components'
import { Network } from './components/network'

import { useAppSelector, useMiddleEllipsis } from '_hooks'

import Logo from '_assets/icons/logo.svg'
import CopyIcon from '_assets/icons/copy.svg'
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
  const address = useAppSelector(({ account: { address } }) => address)

  const shortenAddress = useMiddleEllipsis(address, 10, 7)

  const [modalOpen, setModalOpen] = useState(false)

  const onCopy = () => {
    if (!address) {
      return
    }

    const copyRes = copy(address)
    if (copyRes) {
      toast(<Alert type="success">Copied to clipboard</Alert>, {
        toastId: 'initialize-toast',
      })
    }
  }

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
        className="h-10 !p-0 !top-12 !w-[360px] [&>div]:min-h-[40px] [&>div]:px-6 [&>div]:items-center [&>div]:rounded-none [&>div]:shadow-none !z-50"
      />
      {showHeader && (
        <header className="h-12 px-6 bg-white border-b border-b-[#e6e6e9] flex items-center shrink-0 font-medium z-[1010]">
          <a href="https://morphiswallet.com" target="_blank" rel="noreferrer">
            <Logo height={24} width={24} />
          </a>
          <div className="grow mx-2 text-center cursor-pointer">
            <IconWrapper onClick={onCopy} className="!scale-100">
              <CopyIcon height={14} width={14} className="mr-2" />
              <span>Account1</span>
              <span className="text-[#c0c0c0]">({shortenAddress})</span>
            </IconWrapper>
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

export const Layout = memo(LayoutBase)
