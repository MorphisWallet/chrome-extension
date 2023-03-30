import { useMemo } from 'react'
import cl from 'classnames'

import { useAppSelector, useActiveAddress } from '_hooks'

import { API_ENV } from '_src/shared/api-env'
import { getAddressUrl, getObjectUrl, getTransactionUrl } from './utils'
import { ExplorerLinkType, TxObjectTypes } from './types'

type TxLinkProps = TxObjectTypes &
  React.DOMAttributes<HTMLAnchorElement> & {
    className: string
  }

function useAddress(props: TxLinkProps) {
  const { type } = props
  const isAddress = type === ExplorerLinkType.address
  const isProvidedAddress = isAddress && !props.useActiveAddress
  const activeAddress = useActiveAddress()
  return isProvidedAddress ? props.address : activeAddress
}

export const TxLink = (props: TxLinkProps) => {
  const { children, className, type } = props

  const selectedApiEnv = useAppSelector(({ app }) => app.apiEnv)
  const address = useAddress(props)

  const notCustomRPC = selectedApiEnv !== API_ENV.customRPC
  const objectID = type === ExplorerLinkType.object ? props.objectID : null
  const transactionID =
    type === ExplorerLinkType.transaction ? props.transactionID : null

  const explorerHref = useMemo(() => {
    switch (type) {
      case ExplorerLinkType.address:
        return address && notCustomRPC && getAddressUrl(address, selectedApiEnv)
      case ExplorerLinkType.object:
        return (
          objectID && notCustomRPC && getObjectUrl(objectID, selectedApiEnv)
        )
      case ExplorerLinkType.transaction:
        return (
          transactionID &&
          notCustomRPC &&
          getTransactionUrl(transactionID, selectedApiEnv)
        )
    }
  }, [type, address, notCustomRPC, selectedApiEnv, objectID, transactionID])

  const disableLink = selectedApiEnv === API_ENV.customRPC || !explorerHref

  return (
    <a
      className={cl([
        disableLink && 'pointer-events-none cursor-not-allowed',
        className,
      ])}
      href={explorerHref || undefined}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  )
}
