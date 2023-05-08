import { useEffect, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import copy from 'copy-to-clipboard'
import cl from 'classnames'

import { Loading, IconWrapper, Alert, toast } from '_app/components'

import { useAppDispatch } from '_hooks'

import { loadEntropyFromKeyring } from '_redux/slices/account'
import { entropyToMnemonic, toEntropy } from '_shared/utils/bip39'

import { MNEMONIC_LENGTH } from '_src/shared/constants'

import CopyIcon from '_assets/icons/copy.svg'

let copyTimeout: ReturnType<typeof setTimeout>

type SeedPhraseCardProps = {
  className?: string
}

export const SeedPhraseCard = ({ className }: SeedPhraseCardProps) => {
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState(true)
  const [mnemonic, setMnemonic] = useState<string | null>(null)
  const [tipVisible, setTipVisibility] = useState(false)

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
    })
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)

      try {
        setMnemonic(
          entropyToMnemonic(
            toEntropy(await dispatch(loadEntropyFromKeyring({})).unwrap())
          )
        )
      } catch (e) {
        toast({
          type: 'error',
          message:
            (e as Error)?.message ||
            'Something is wrong, Recovery Phrase is empty.',
          containerId: 'initialize-toast',
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [dispatch])

  const mnemonicArray = mnemonic?.split(' ') || []

  return (
    <Loading loading={loading}>
      {!!mnemonicArray?.length && (
        <div className={cl(['flex flex-col grow justify-center', className])}>
          <div className="grid grid-cols-3 grid-rows-4 px-3.5 py-3 mb-2.5 gap-x-1 gap-y-4 border border-[#7e7e7e] rounded-[10px]">
            {Array(MNEMONIC_LENGTH)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="flex text-[13px]">
                  <span className="text-[#c8c8c8] w-6 shrink-0 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    data-tooltip-content={mnemonicArray[i]}
                    data-tooltip-id="mnemonic-tooltip"
                    className="truncate"
                  >
                    {mnemonicArray[i]}
                  </span>
                </div>
              ))}
            <Tooltip
              clickable
              id="mnemonic-tooltip"
              place="top"
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
  )
}
