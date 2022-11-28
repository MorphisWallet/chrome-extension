import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { Layout } from '_app/layouts'
import { Loading, Alert } from '_components/index'
import { StepOne } from './components/step_one'
import { StepTwo } from './components/step_two'

import { useAppDispatch, useLockedGuard, useInitializedGuard } from '_hooks'

import { loadEntropyFromKeyring } from '_redux/slices/account'

import { entropyToMnemonic, toEntropy } from '_shared/utils/bip39'

export const Backup = () => {
  const dispatch = useAppDispatch()
  const guardsLoading = useLockedGuard(false)
  const checkingInitialized = useInitializedGuard(true)

  const [mnemonicLoading, setMnemonicLoading] = useState(false)
  const [mnemonic, setMnemonic] = useState<string | null>(null)

  const [step, setStep] = useState<0 | 1>(1)

  const onInit = async () => {
    if (guardsLoading) {
      return
    }

    setMnemonicLoading(true)
    try {
      const raw = await dispatch(loadEntropyFromKeyring({})).unwrap()
      const entropy = toEntropy(raw)
      const mnemonic = entropyToMnemonic(entropy)
      setMnemonic(mnemonic)
    } catch (e) {
      console.warn(e)
      toast(<Alert type="error">{`Fail to load mnemonics, ${e}`}</Alert>)
    } finally {
      setMnemonicLoading(false)
    }
  }

  useEffect(() => {
    onInit()
  }, [])

  const renderContent = () => {
    if (step === 0) {
      return (
        <StepOne
          mnemonic={mnemonic}
          mnemonicLoading={mnemonicLoading}
          setStep={setStep}
        />
      )
    }

    return <StepTwo mnemonic={mnemonic} setStep={setStep} />
  }
  return (
    <Loading loading={guardsLoading || checkingInitialized}>
      <Layout showHeader={false} showNav={false}>
        {renderContent()}
      </Layout>
    </Loading>
  )
}
