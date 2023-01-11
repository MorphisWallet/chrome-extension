import { useEffect, useState } from 'react'

import Layout from '_app/layouts'
import { Loading, toast } from '_app/components'
import BackupStepOne from './components/step_one'
import BackupStepTwo from './components/step_two'

import { useLockedGuard, useInitializedGuard } from '_hooks'

import { thunkExtras } from '_src/ui/app/redux/store/thunk-extras'

const BackupPage = () => {
  const guardsLoading = useLockedGuard(false)
  const checkingInitialized = useInitializedGuard(true)

  const [mnemonicLoading, setMnemonicLoading] = useState(false)
  const [mnemonic, setMnemonic] = useState<string | null>(null)

  const [step, setStep] = useState<0 | 1>(0)

  const onInit = async () => {
    if (guardsLoading) {
      return
    }

    setMnemonicLoading(true)
    try {
      const mnemonic = thunkExtras.keypairVault.mnemonic
      setMnemonic(mnemonic)
    } catch (e) {
      console.warn(e)
      toast({
        type: 'error',
        message: `Fail to load mnemonics, ${e}`,
        containerId: 'initialize-toast',
      })
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
        <BackupStepOne
          mnemonic={mnemonic}
          mnemonicLoading={mnemonicLoading}
          setStep={setStep}
        />
      )
    }

    return <BackupStepTwo mnemonic={mnemonic} setStep={setStep} />
  }
  return (
    <Loading loading={guardsLoading || checkingInitialized}>
      <Layout showHeader={false} showNav={false}>
        {renderContent()}
      </Layout>
    </Loading>
  )
}

export default BackupPage
