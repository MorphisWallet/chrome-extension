import { formatAddress } from '@mysten/sui.js'
import copy from 'copy-to-clipboard'

import { toast, IconWrapper } from '_app/components'

import { useAppSelector } from '_hooks'

import { activeAccountSelector } from '_redux/slices/account'

import CopyIcon from '_assets/icons/copy.svg'

type AddressProps = {
  addressOnly?: boolean
  address?: string
}

export const Address = ({ addressOnly = false, address }: AddressProps) => {
  const activeAccount = useAppSelector(activeAccountSelector)

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

  const formatedAddress = formatAddress(address || activeAccount.address)

  return (
    <IconWrapper onClick={onCopy} className="!scale-100">
      <span className="text-[#c0c0c0]">
        {addressOnly ? formatedAddress : `(${formatedAddress})`}
      </span>
      <CopyIcon height={14} width={14} className="ml-2" />
    </IconWrapper>
  )
}
