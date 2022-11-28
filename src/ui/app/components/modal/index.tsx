import { CSSTransition } from 'react-transition-group'

import './modal.css'

type ModalProps = {
  open: boolean
  onClose: () => void
  delay?: number
  children: React.ReactNode | React.ReactNode[]
}

const TRANSITION_DELAY = 250

export const Modal = ({
  open,
  delay = TRANSITION_DELAY,
  children,
}: ModalProps) => {
  return (
    <CSSTransition
      in={open}
      timeout={delay}
      unmountOnExit
      classNames="morphis-modal"
    >
      <div className="h-full w-full bg-white flex flex-col">{children}</div>
    </CSSTransition>
  )
}
