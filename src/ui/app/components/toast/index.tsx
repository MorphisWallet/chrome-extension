import { toast as reactToast } from 'react-toastify'

import { Alert, AlertType } from '_app/components'

type ToastProps = {
  type: AlertType
  message: React.ReactNode
  containerId?: string
  toastId?: string
}

export const toast = ({
  type,
  message,
  containerId = 'global-toast',
  toastId,
}: ToastProps) => {
  reactToast(<Alert type={type}>{message}</Alert>, {
    toastId,
    containerId,
  })
}
