import { useNavigate } from 'react-router-dom'
import copy from 'copy-to-clipboard'
import { formatAddress } from '@mysten/sui.js'

import Layout from '_app/layouts'
import { IconWrapper, Button, toast } from '_app/components'

import { useActiveAddress, useAccountsMeta } from '_hooks'

import ArrowShort from '_assets/icons/arrow_short.svg'

const ReceivePage = () => {
  const navigate = useNavigate()
  const activeAddress = useActiveAddress()
  const accountsMeta = useAccountsMeta()

  const onCopy = () => {
    if (!activeAddress) return

    const copyRes = copy(activeAddress)
    if (copyRes) {
      toast({
        type: 'success',
        message: 'Copied to clipboard',
        containerId: 'global-toast',
      })
    }
  }

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
        <div className="mb-6 text-xl text-center font-bold relative">
          {'Receive'}
          <IconWrapper
            onClick={() => navigate(-1)}
            className="absolute left-0 top-[8px]"
          >
            <ArrowShort height={10} width={13} />
          </IconWrapper>
        </div>
        <div className="flex items-center p-2 border border-[#d9d9d9] rounded">
          <span className="pr-1">
            {accountsMeta?.[activeAddress || '']?.alias || ''}:{' '}
          </span>
          <span className="text-[#c0c0c0]">
            {formatAddress(activeAddress || '')}
          </span>
          <div className="grow flex justify-end">
            <Button className="!h-8 !w-auto" onClick={onCopy}>
              Copy
            </Button>
          </div>
        </div>
        <div className="grow flex flex-col justify-end">
          <Button onClick={() => navigate(-1)}>Close</Button>
        </div>
      </div>
    </Layout>
  )
}

export default ReceivePage
