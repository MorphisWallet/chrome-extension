import { useState } from 'react'

import { Layout } from '_app/layouts'
import { Loading } from '_app/components'
import { StepOne } from './components/step_one'
import { StepTwo } from './components/step_two'

import { useAppDispatch, useLockedGuard, useInitializedGuard } from '_hooks'

import Logo from '_assets/icons/logo.svg'

import { MnemonicField, PasswordField } from './type'

export const ImportPage = () => {
  const dispatch = useAppDispatch()
  const guardsLoading = useLockedGuard(false)
  const checkingInitialized = useInitializedGuard(false)

  const [step, setStep] = useState<0 | 1>(0)
  const [formData, setFormData] = useState<MnemonicField>({
    mnemonic: '',
  })

  const onNext = (values: MnemonicField) => {
    setFormData({
      ...formData,
      mnemonic: values.mnemonic,
    })
    setStep(1)
  }

  const onSubmit = async (values: PasswordField) => {
    //
  }

  const renderForm = () => {
    if (step === 0) {
      return <StepOne mnemonic={formData.mnemonic} onSubmit={onNext} />
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
