import copy from 'copy-to-clipboard'

import { toast, IconWrapper } from '_app/components'

import { useAppSelector, useMiddleEllipsis } from '_hooks'

import CopyIcon from '_assets/icons/copy.svg'

type AddressProps = {
  addressOnly?: boolean
}

export const Address = ({ addressOnly = false }: AddressProps) => {
  const address = useAppSelector(({ account: { address } }) => address)

  const shortenAddress = useMiddleEllipsis(address, 10, 7)

  const onCopy = () => {
    if (!address) {
      return
    }

    const copyRes = copy(address)
    console.log(123)
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
      <CopyIcon height={14} width={14} className="mr-2" />
      {!addressOnly && <span>Account1</span>}
      <span className="text-[#c0c0c0]">
        {addressOnly ? shortenAddress : `(${shortenAddress})`}
      </span>
    </IconWrapper>
  )
}
