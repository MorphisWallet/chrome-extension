import { useEffect, useState } from 'react'

import Layout from '_app/layouts'
import { Loading, toast } from '_app/components'
import BackupStepOne from './components/step_one'
import BackupStepTwo from './components/step_two'

import { useLockedGuard, useInitializedGuard, useAppDispatch } from '_hooks'

import { loadEntropyFromKeyring } from '_redux/slices/account'
import { entropyToMnemonic, toEntropy } from '_shared/utils/bip39'

const BackupPage = () => {
  const guardsLoading = useLockedGuard(false)
  const checkingInitialized = useInitializedGuard(true)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState(true)
  const [mnemonic, setMnemonic] = useState<string | null>(null)

  const [step, setStep] = useState<0 | 1>(0)

  useEffect(() => {
    ;(async () => {
      if (guardsLoading) {
        return
      }
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
            (e as Error).message ||
            'Something is wrong, Recovery Phrase is empty.',
          containerId: 'initialize-toast',
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [dispatch, guardsLoading])

  const renderContent = () => {
    if (step === 0) {
      return (
        <BackupStepOne
          mnemonic={mnemonic}
          mnemonicLoading={loading}
          setStep={setStep}
        />
      )
    }

    return <BackupStepTwo mnemonic={mnemonic} setStep={setStep} />
  }
  return (
    <Loading loading={guardsLoading || checkingInitialized || loading}>
      <Layout showHeader={false} showNav={false}>
        {renderContent()}
      </Layout>
    </Loading>
  )
}

export default BackupPage
