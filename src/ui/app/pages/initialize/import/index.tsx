import { useState } from 'react'

import { Layout } from '_app/layouts'
import { Loading, toast } from '_app/components'
import { StepOne } from './components/step_one'
import { StepTwo } from './components/step_two'

import { useAppDispatch, useLockedGuard, useInitializedGuard } from '_hooks'

import { createVault } from '_redux/slices/account'

import { MAIN_UI_URL } from '_shared/utils'
import { entropyToSerialized, mnemonicToEntropy } from '_shared/utils/bip39'

import Logo from '_assets/icons/logo.svg'

import type { MnemonicField, PasswordField } from './type'

const ImportPage = () => {
  const dispatch = useAppDispatch()
  const guardsLoading = useLockedGuard(false)
  const checkingInitialized = useInitializedGuard(false)

  const [step, setStep] = useState<0 | 1>(0)
  const [mnemonic, setMnemonic] = useState('')

  const onNext = (values: MnemonicField) => {
    setMnemonic(values.mnemonic.trim())
    setStep(1)
  }

  const onSubmit = async ({ password }: PasswordField) => {
    try {
      await dispatch(
        createVault({
          importedEntropy: entropyToSerialized(mnemonicToEntropy(mnemonic)),
          password,
        })
      ).unwrap()

      // refresh the page to re-initialize the store
      window.location.href = MAIN_UI_URL
    } catch (e) {
      toast({
        type: 'error',
        message: `Fail to import wallet, ${e}`,
        containerId: 'initialize-toast',
      })
    }
  }

  const renderForm = () => {
    if (step === 0) {
      return <StepOne mnemonic={mnemonic} onSubmit={onNext} />
    }

    return <StepTwo onBack={() => setStep(0)} onSubmit={onSubmit} />
  }

  return (
    <Loading loading={guardsLoading || checkingInitialized}>
      <Layout showHeader={false} showNav={false}>
        <div className="flex flex-col grow items-center p-10 pt-24">
          <a
            href="https://morphiswallet.com"
            target="_blank"
            rel="noreferrer"
            className="mb-4"
          >
            <Logo height={55} width={58} />
          </a>
          <p className="mb-10 text-2xl font-bold">Import an Existing Wallet</p>
          {renderForm()}
        </div>
      </Layout>
    </Loading>
  )
}

export default ImportPage
