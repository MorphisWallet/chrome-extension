import { toast as reactToast } from 'react-toastify'

import { Alert, AlertType } from '_app/components'

type ToastProps = {
  type: AlertType
  message: React.ReactNode
  toastId?: string
}

export const toast = ({
  type,
  message,
  toastId = 'global-toast',
}: ToastProps) => {
  reactToast(<Alert type={type}>{message}</Alert>, {
    toastId,
  })
}
