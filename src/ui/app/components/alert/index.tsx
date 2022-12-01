import cl from 'classnames'

import ErrorIcon from '_assets/icons/error.svg'
import CheckIcon from '_assets/icons/check.svg'

const DEFAULT_ICON_SIZE = 16

export type AlertType = 'success' | 'error'

type AlertProps = {
  type: AlertType
  children: React.ReactNode
  size?: number
  className?: string
}

const mapIcon = (type: AlertType, size: number) => {
  switch (type) {
    case 'success': {
      return <CheckIcon height={size} width={size} />
    }
    case 'error': {
      return <ErrorIcon height={size} width={size} />
    }
    default: {
      return null
    }
  }
}

export const Alert = ({
  type,
  size = DEFAULT_ICON_SIZE,
  children,
  className,
}: AlertProps) => (
  <div className={cl(['flex items-center', className])}>
    <div className="shrink-0">{mapIcon(type, size)}</div>
    <div className="ml-2 max-h-20 overflow-y-auto">{children}</div>
  </div>
)
