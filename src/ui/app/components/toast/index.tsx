import { toast as reactToast } from 'react-toastify'

import { Alert, AlertType } from '_app/components'

type ToastProps = {
  type: AlertType
  content: React.ReactNode
  toastId?: string
}

export const toast = ({
  type,
  content,
  toastId = 'global-toast',
}: ToastProps) => {
  reactToast(<Alert type={type}>{content}</Alert>, {
    toastId,
  })
}
