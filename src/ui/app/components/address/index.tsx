import copy from 'copy-to-clipboard'

import { toast, IconWrapper } from '_app/components'

import { useAppSelector, useMiddleEllipsis } from '_hooks'

import CopyIcon from '_assets/icons/copy.svg'

type AddressProps = {
  addressOnly?: boolean
}

export const Address = ({ addressOnly = false }: AddressProps) => {
  const { address, alias } = useAppSelector(
    ({ account: { address, alias } }) => ({
      address,
      alias,
    })
  )

  const shortenAddress = useMiddleEllipsis(address, 10, 7)
  const shortenAlias = useMiddleEllipsis(alias, 10, 7)

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
      {!addressOnly && <span>{shortenAlias}</span>}
      <span className="text-[#c0c0c0]">
        {addressOnly ? shortenAddress : `(${shortenAddress})`}
      </span>
      <CopyIcon height={14} width={14} className="ml-2" />
    </IconWrapper>
  )
}
