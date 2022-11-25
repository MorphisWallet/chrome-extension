import { Outlet } from 'react-router-dom'
import { ToastContainer, Slide } from 'react-toastify'

import { IconWrapper } from '../../components'

import CloseIcon from '_assets/icons/close.svg'

export const Initialize = () => (
  <>
    <ToastContainer
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
      className="h-10 !p-0 !top-0 !w-[360px] [&>div]:min-h-[40px] [&>div]:px-6 [&>div]:items-center [&>div]:rounded-none [&>div>:shadow-none"
    />
    <Outlet />
  </>
)
