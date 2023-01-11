import copy from 'copy-to-clipboard'

import { toast, IconWrapper } from '_app/components'

import { useAppSelector, useMiddleEllipsis } from '_hooks'

import { activeAccountSelector } from '_redux/slices/account'

import CopyIcon from '_assets/icons/copy.svg'

type AddressProps = {
  addressOnly?: boolean
  address?: string
}

export const Address = ({ addressOnly = false, address }: AddressProps) => {
  const activeAccount = useAppSelector(activeAccountSelector)
  const shortenAddress = useMiddleEllipsis(
    address || activeAccount?.address || '',
    10,
    7
  )
  const shortenAlias = useMiddleEllipsis(activeAccount?.alias || '', 10, 7)

  const onCopy = () => {
    if (!activeAccount) return

    const copyRes = copy(activeAccount.address)
    if (copyRes) {
      toast({
        type: 'success',
        message: 'Copied to clipboard',
        containerId: 'global-toast',
      })
    }
  }

  if (!activeAccount) return null

  return (
    <IconWrapper onClick={onCopy} className="!scale-100">
      {!addressOnly && <span>{shortenAlias}</span>}
      <span className="text-[#c0c0c0]">
        {addressOnly ? shortenAddress : `(${shortenAddress})`}
      </span>
      <CopyIcon height={14} width={14} className="ml-2" />
    </IconWrapper>
  )
}
