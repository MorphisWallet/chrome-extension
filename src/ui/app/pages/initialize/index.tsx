import { Outlet } from 'react-router-dom'
import { ToastContainer, Slide } from 'react-toastify'

import { IconWrapper } from '_components/icon_wrapper'

import CloseIcon from '_assets/icons/close.svg'

const InitializePage = () => (
  <>
    <ToastContainer
      containerId="initialize-toast"
      position="top-center"
      autoClose={3000}
      limit={1}
      enableMultiContainer
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

export default InitializePage
