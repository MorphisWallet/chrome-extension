import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import copy from 'copy-to-clipboard'

import Layout from '_app/layouts'
import { IconWrapper, Loading, Alert, toast } from '_app/components'

import { useAppDispatch } from '_hooks'

import { loadEntropyFromKeyring } from '_redux/slices/account'

import { MNEMONIC_LENGTH } from '_src/shared/constants'
import { entropyToMnemonic, toEntropy } from '_shared/utils/bip39'

import ArrowShort from '_assets/icons/arrow_short.svg'
import CopyIcon from '_assets/icons/copy.svg'

let copyTimeout: ReturnType<typeof setTimeout>

const SeedPhrasePage = () => {
  const dispatch = useAppDispatch()

  const [mnemonicLoading, setMnemonicLoading] = useState(false)
  const [mnemonic, setMnemonic] = useState<string | null>(null)
  const [tipVisible, setTipVisibility] = useState(false)

  const onInit = async () => {
    setMnemonicLoading(true)
    try {
      const raw = await dispatch(loadEntropyFromKeyring({})).unwrap()
      const entropy = toEntropy(raw)
      const mnemonic = entropyToMnemonic(entropy)
      setMnemonic(mnemonic)
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
    if (!mnemonic) {
      return
    }

    const copyRes = copy(mnemonic)
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
      containerId: 'initialize-toast',
    })
  }

  useEffect(() => {
    onInit()
  }, [])

  const mnemonicArray = mnemonic?.split(' ')

  return (
    <Layout>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
        <div className="mb-6 text-xl text-center font-bold relative">
          Seed Phrase
          <Link to="/settings/sap" className="absolute left-0 top-[7px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <Loading loading={mnemonicLoading}>
          {!!mnemonicArray?.length && (
            <div className="flex flex-col grow justify-center">
              <div className="grid grid-cols-3 grid-rows-4 px-3.5 py-3 mb-2.5 gap-x-1 gap-y-4 border border-[#7e7e7e] rounded-[10px]">
                {Array(MNEMONIC_LENGTH)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="flex text-[13px]">
                      <span className="text-[#c8c8c8] w-6 shrink-0 select-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        data-tip={mnemonicArray[i]}
                        data-for="mnemonic-tooltip"
                        className="truncate"
                      >
                        {mnemonicArray[i]}
                      </span>
                    </div>
                  ))}
                <ReactTooltip
                  id="mnemonic-tooltip"
                  place="top"
                  effect="solid"
                  padding="4px 8px"
                  delayHide={500}
                  className="!pointer-events-auto before:hidden hover:!visible hover:!opacity-100"
                />
              </div>
              <div className="self-start relative">
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
        </Loading>
      </div>
    </Layout>
  )
}

export default SeedPhrasePage
