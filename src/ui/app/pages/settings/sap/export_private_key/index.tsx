import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import copy from 'copy-to-clipboard'

import Layout from '_app/layouts'
import { Loading, IconWrapper, Alert, toast } from '_app/components'
import Confirm from '../_components/confirm'

import { thunkExtras } from '_src/ui/app/redux/store/thunk-extras'

import ArrowShort from '_assets/icons/arrow_short.svg'
import CopyIcon from '_assets/icons/copy.svg'

let copyTimeout: ReturnType<typeof setTimeout>

const ExportPrivateKeyPage = () => {
  const [showConfirm, setShowConfirm] = useState(true)
  const [mnemonicLoading, setMnemonicLoading] = useState(false)
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const [tipVisible, setTipVisibility] = useState(false)

  const onInit = async () => {
    setMnemonicLoading(true)
    try {
      const keypair = thunkExtras.keypairVault.getKeyPair()
      const { privateKey } = keypair.export()
      setPrivateKey(privateKey)
    } catch (e) {
      console.warn(e)
      toast({
        type: 'error',
        message: `Fail to load mnemonics, ${e}`,
      })
    } finally {
      setMnemonicLoading(false)
    }
  }

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

  useEffect(() => {
    onInit()
  }, [])

  return (
    <Layout showNav={!showConfirm}>
      <Loading loading={mnemonicLoading}>
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
              onSuccess={() => setShowConfirm(false)}
            />
          ) : (
            <div className="flex flex-col grow justify-center items-start">
              <p className="text-lg text-[#929294] leading-6 mb-8">
                Do not share private key with anyone, including Morphis.
              </p>
              <p className="text-center text-sm mb-2">{privateKey}</p>
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
      </Loading>
    </Layout>
  )
}

export default ExportPrivateKeyPage
