import copy from 'copy-to-clipboard'

import { toast, IconWrapper } from '_app/components'

import { useAppSelector, useMiddleEllipsis } from '_hooks'

import CopyIcon from '_assets/icons/copy.svg'

type AddressProps = {
  showAddress?: boolean
  showIcon?: boolean
}

export const Address = ({
  showAddress = true,
  showIcon = true,
}: AddressProps) => {
  const address = useAppSelector(({ account: { address } }) => address)

  const shortenAddress = useMiddleEllipsis(address, 10, 7)

  const onCopy = () => {
    if (!address) {
      return
    }

    const copyRes = copy(address)
    if (copyRes) {
      toast({
        type: 'success',
        message: 'Copied to clipboard',
        containerId: 'global-toast',
      })
    }
  }

  return (
    <IconWrapper onClick={onCopy} className="!scale-100">
      {showIcon && <CopyIcon height={14} width={14} className="mr-2" />}
      {showAddress && <span>Account1</span>}
      <span className="text-[#c0c0c0]">({shortenAddress})</span>
    </IconWrapper>
  )
}
