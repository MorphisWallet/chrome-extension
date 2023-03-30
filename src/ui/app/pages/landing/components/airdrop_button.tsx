import { useEffect } from 'react'

import { Button, toast } from '_app/components'

import { useFaucetMutation } from '_src/ui/app/shared/faucet/useFaucetMutation'
import { useAppSelector } from '_hooks'

import { API_ENV } from '_src/shared/api-env'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

const AirdropButton = () => {
  const network = useAppSelector(({ app }) => app.apiEnv)
  const mutation = useFaucetMutation()

  const allowAirdrop = API_ENV.customRPC !== network

  useEffect(() => {
    toast({
      type: 'error',
      message: (mutation.error as Error)?.message || 'Failed to faucet',
    })
  }, [mutation.isError])

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={() => mutation.mutate()}
        loading={mutation.isLoading}
        disabled={!allowAirdrop || mutation.isLoading || mutation.isMutating}
        className="h-[40px] w-[40px] px-0 mb-2 rounded-full flex justify-center items-center"
      >
        <ArrowIcon className="rotate-180" />
      </Button>
      <span>Airdrop</span>
    </div>
  )
}

export default AirdropButton
