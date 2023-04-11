import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatAddress, getTransactionDigest } from '@mysten/sui.js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikProps } from 'formik'
import cl from 'classnames'

import { Button, TxLink, toast } from '_app/components'

import { useFormatCoin, useCoinDecimals } from '_src/ui/core'
import {
  useActiveAddress,
  useSigner,
  useTransactionGasBudget,
  useGetCoins,
} from '_hooks'

import { createTokenTransferTransaction } from '../utils'
import { coinMap } from '_src/ui/utils/coinMap'
import { GAS_SYMBOL } from '_redux/slices/sui-objects/Coin'
import { getSignerOperationErrorMessage } from '_src/ui/app/helpers/errorMessages'
import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'

import type { CoinBalance } from '@mysten/sui.js'
import type { ConfirmFields } from '../utils'

type ConfirmStepTwoProps = {
  coinBalance: CoinBalance | undefined
  formikProps: FormikProps<ConfirmFields>
}

const SendStepTwo = ({ coinBalance, formikProps }: ConfirmStepTwoProps) => {
  const { values } = formikProps
  const coinInfo = coinMap[coinBalance?.coinType || '']

  const navigate = useNavigate()
  const signer = useSigner()
  const queryClient = useQueryClient()
  const activeAddress = useActiveAddress()
  const [, symbol] = useFormatCoin(
    coinBalance?.totalBalance,
    coinBalance?.coinType
  )
  const [decimals] = useCoinDecimals(coinBalance?.coinType)
  const { data: coinsData, isLoading: coinsIsLoading } = useGetCoins(
    coinBalance?.coinType || '',
    activeAddress || ''
  )

  const [executing, setExecuting] = useState(false)

  const transaction = useMemo(() => {
    if (!signer || !values || !activeAddress) return null

    return createTokenTransferTransaction({
      coinType: coinBalance?.coinType || '',
      coinDecimals: decimals,
      to: values.address,
      amount: values.amount,
      coins:
        coinsData?.filter(({ lockedUntilEpoch }) => !lockedUntilEpoch) || [],
      isPayAllSui: false,
    })
  }, [coinsData, signer, values.address, values.amount, decimals])

  const { data: gasBudget } = useTransactionGasBudget(
    activeAddress,
    transaction
  )

  const executeTransfer = useMutation({
    mutationFn: async () => {
      if (!transaction || !signer) {
        throw new Error('Missing data')
      }

      setExecuting(true)
      return signer.signAndExecuteTransactionBlock({
        transactionBlock: transaction,
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
        },
      })
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(['get-coins'])
      queryClient.invalidateQueries(['coin-balance'])

      const digest = getTransactionDigest(response)
      navigate(`/send?type=${coinBalance?.coinType}`)
      setTimeout(() => {
        toast({
          type: 'success',
          message: (
            <p>
              {`Successfully transferred ${values.amount} to ${values.address} `}
              <TxLink
                transactionID={digest}
                type={ExplorerLinkType.transaction}
              >
                View on explorer
              </TxLink>
            </p>
          ),
        })
      }, 0)
    },
    onError: (error) => {
      toast({
        type: 'error',
        message: getSignerOperationErrorMessage(error),
      })
    },
    onSettled: () => {
      setExecuting(false)
    },
  })

  return (
    <div className="flex flex-col grow items-center font-medium text-sm">
      <div
        className={cl([
          'h-[56px] w-[56px] mb-2',
          !coinInfo && 'bg-[#c4c4c4] text-white rounded-full',
        ])}
      >
        {coinInfo?.icon({ height: 56, width: 56 }) || symbol[0]}
      </div>
      <p className="mb-10 font-bold">{symbol}</p>
      <div className="flex justify-between w-full">
        <span className="text-[#9f9d9d]">Send to</span>
        <span title={values.address}>
          {formatAddress(values.address || '')}
        </span>
      </div>
      <hr className="border-t border-t-[#c4c4c4] my-4 w-full" />
      <div className="flex justify-between w-full mb-2">
        <span className="text-[#9f9d9d] shrink-0 mr-2">Total value</span>
        <span className="flex shrink truncate">
          <span title={values.amount} className="truncate">
            {values.amount || '-'}
          </span>
          <span className="ml-1">{symbol}</span>
        </span>
      </div>
      <div className="flex justify-between w-full">
        <span className="text-[#9f9d9d] shrink-0 mr-2">Est. gas fee</span>
        <span className="flex shrink truncate">
          <span title={gasBudget} className="truncate">
            {gasBudget || '-'}
          </span>
          <span className="ml-1">{GAS_SYMBOL}</span>
        </span>
      </div>
      <div className="grow" />
      <Button
        type="button"
        loading={executing}
        disabled={coinsIsLoading || executing}
        onClick={() => executeTransfer.mutateAsync()}
      >
        Confirm and Send
      </Button>
    </div>
  )
}

export default SendStepTwo
