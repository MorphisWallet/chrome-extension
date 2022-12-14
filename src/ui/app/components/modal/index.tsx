import CSSTransition from 'react-transition-group/CSSTransition'
import cl from 'classnames'

import './modal.css'

type ModalProps = {
  open: boolean
  onClose: () => void
  delay?: number
  className?: string
  children: React.ReactNode | React.ReactNode[]
}

const TRANSITION_DELAY = 250

export const Modal = ({
  open,
  delay = TRANSITION_DELAY,
  className,
  children,
}: ModalProps) => {
  return (
    <CSSTransition
      in={open}
      timeout={delay}
      unmountOnExit
      classNames={cl(['morphis-modal', className])}
    >
      <div className="h-full w-full bg-white flex flex-col">{children}</div>
    </CSSTransition>
  )
}
