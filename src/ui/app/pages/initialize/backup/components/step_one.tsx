import { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { toast } from 'react-toastify'
import copy from 'copy-to-clipboard'

import { Stepper, Loading, Button, IconWrapper, Alert } from '_components/index'

import { MNEMONIC_LENGTH } from '_src/shared/constants'

import CopyIcon from '_assets/icons/copy.svg'

type StepOneProps = {
  mnemonic: string | null
  mnemonicLoading: boolean
  setStep: (args: 0 | 1) => void
}

let copyTimeout: ReturnType<typeof setTimeout>

export const StepOne = ({
  mnemonic,
  mnemonicLoading,
  setStep,
}: StepOneProps) => {
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

    toast(<Alert type="error">Fail to copy, try to copy manually</Alert>, {
      toastId: 'initialize-toast',
    })
  }

  const mnemonicArray = mnemonic?.split(' ')

  return (
    <div className="flex flex-col grow px-10 pb-10">
      <Stepper steps={3} current={1} />
      <div className="flex flex-col justify-center grow font-medium">
        <p className="text-2xl mb-3">Write down your recovery phrase</p>
        <p className="text-lg text-[#929294] leading-6 mb-8">
          Make sure to store it{' '}
          <span className="font-bold">in a safe place</span>
        </p>
        <Loading loading={mnemonicLoading}>
          {!!mnemonicArray?.length && (
            <>
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
            </>
          )}
        </Loading>
      </div>
      <Button
        disabled={!mnemonicArray?.length}
        loading={mnemonicLoading}
        onClick={() => setStep(1)}
      >
        I saved my recovery phrase
      </Button>
    </div>
  )
}
