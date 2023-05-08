import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import copy from 'copy-to-clipboard'
import { useMutation } from '@tanstack/react-query'
import { fromB64 } from '@mysten/sui.js'

import Layout from '_app/layouts'
import { IconWrapper, Alert, toast } from '_app/components'
import Confirm from '../_components/confirm'

import { useActiveAddress } from '_src/ui/app/hooks'
import { useBackgroundClient } from '_src/ui/app/hooks/useBackgroundClient'

import { bytesToHex } from '@noble/hashes/utils'

import ArrowShort from '_assets/icons/arrow_short.svg'
import CopyIcon from '_assets/icons/copy.svg'

let copyTimeout: ReturnType<typeof setTimeout>

const ExportPrivateKeyPage = () => {
  const activeAddress = useActiveAddress()
  const backgroundClient = useBackgroundClient()
  const exportMutation = useMutation({
    mutationKey: ['export-account', activeAddress],
    mutationFn: async (password: string) => {
      if (!activeAddress) {
        return null
      }
      return await backgroundClient.exportAccount(password, activeAddress)
    },
  })

  const [showConfirm, setShowConfirm] = useState(true)
  const [tipVisible, setTipVisibility] = useState(false)

  const privateKey = useMemo(() => {
    if (exportMutation.data?.privateKey) {
      return `${bytesToHex(
        fromB64(exportMutation.data.privateKey).slice(0, 32)
      )}`
    }
    return null
  }, [exportMutation.data?.privateKey])

  const onCopy = () => {
    if (!privateKey) {
      return
    }

    const copyRes = copy(privateKey)
    if (copyRes) {
      clearTimeout(copyTimeout)
      setTipVisibility(true)

      copyTimeout = setTimeout(() => {
        setTipVisibility(false)
      }, 3000)
      return
    }

    toast({
      type: 'error',
      message: 'Fail to copy, try to copy manually',
    })
  }

  const onExportPrivateKey = async (password: string) => {
    try {
      await exportMutation.mutateAsync(password)
      setShowConfirm(false)
    } catch (e) {
      toast({
        type: 'error',
        message: (e as Error)?.message || 'Failed to export private key',
      })
    }
  }

  return (
    <Layout showNav={!showConfirm}>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
        <div className="mb-6 text-xl text-center font-bold relative">
          Export private key
          <Link to="/settings/sap" className="absolute left-0 top-[7px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        {showConfirm ? (
          <Confirm
            warnings="Enter your password to show the private key. Never share the private key. Anyone with the key will have full access to your wallet."
            checkboxText="I will not share my private key with anyone, including Morphis."
            onSuccess={onExportPrivateKey}
          />
        ) : (
          <div className="flex flex-col grow justify-center items-start">
            <p className="text-lg text-[#929294] leading-6 mb-8">
              Do not share private key with anyone, including Morphis.
            </p>
            <p className="text-left text-sm break-all mb-2">{privateKey}</p>
            <div className="relative">
              <IconWrapper onClick={onCopy}>
                <CopyIcon height={14} width={14} className="mr-2" />
                Copy
              </IconWrapper>
              {tipVisible && (
                <Alert
                  type="success"
                  className="absolute justify-center h-[30px] w-[166px] left-[64px] top-[-7px] shadow-[0_2px_6px_0_rgba(165,161,161,0.25)] animate-fade-in"
                >
                  Copied to clipboard
                </Alert>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ExportPrivateKeyPage
