import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  formatAddress,
  getTransactionDigest,
  SUI_TYPE_ARG,
  Coin,
} from '@mysten/sui.js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormikProps } from 'formik'
import cl from 'classnames'

import { Button, TxLink, toast, Loading } from '_app/components'

import { useFormatCoin, useCoinMetadata, CoinFormat } from '_src/ui/core'
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

import type { ConfirmFields } from '../utils'

type ConfirmStepTwoProps = {
  coinType: string
  formikProps: FormikProps<ConfirmFields>
}

const SendStepTwo = ({ coinType, formikProps }: ConfirmStepTwoProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const activeAddress = useActiveAddress()
  const signer = useSigner()
  // Get all coins of the type
  const { data: coinsData, isLoading: coinsIsLoading } = useGetCoins(
    coinType,
    activeAddress
  )
  // const { data: suiCoinsData, isLoading: suiCoinsIsLoading } = useGetCoins(
  //   SUI_TYPE_ARG,
  //   activeAddress!
  // )

  const coinBalance = Coin.totalBalance(coinsData || [])
  // const suiBalance = Coin.totalBalance(suiCoinsData || [])

  const { data: coinMetadata } = useCoinMetadata(coinType)
  const coinDecimals = coinMetadata?.decimals ?? 0

  const [, symbol, queryResult] = useFormatCoin(
    coinBalance,
    coinType,
    CoinFormat.FULL
  )

  const transaction = useMemo(() => {
    if (
      !signer ||
      !formikProps.values.amount ||
      !formikProps.values.address ||
      !coinsData
    ) {
      return null
    }

    return createTokenTransferTransaction({
      coinType,
      coinDecimals: coinMetadata?.decimals ?? 0,
      to: formikProps.values.address,
      amount: formikProps.values.amount,
      isPayAllSui: false,
      coins: coinsData,
    })
  }, [
    signer,
    coinsData,
    coinMetadata,
    coinType,
    formikProps.values.amount,
    formikProps.values.address,
  ])

  const transactionGas = useMemo(() => {
    if (
      !formikProps.values.amount ||
      !formikProps.values.address ||
      !coinsData
    ) {
      return null
    }

    return createTokenTransferTransaction({
      to: formikProps.values.address,
      amount: formikProps.values.amount,
      coinType: SUI_TYPE_ARG,
      coinDecimals,
      isPayAllSui: false,
      coins: coinsData,
    })
  }, [
    coinMetadata,
    coinsData,
    formikProps.values.amount,
    formikProps.values.address,
  ])

  const { data: gasBudget, isLoading: isGasLoading } = useTransactionGasBudget(
    activeAddress,
    transactionGas
  )

  const coinInfo = coinMap[coinMetadata?.symbol || '']

  const executeTransfer = useMutation({
    mutationFn: async () => {
      if (!transaction || !signer) {
        throw new Error('Missing data')
      }

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
      setTimeout(() => {
        toast({
          type: 'success',
          message: (
            <p>
              {`Successfully transferred ${formikProps.values.amount} to ${formikProps.values.address} `}
              <TxLink
                className="text-[#6bb7e9]"
                transactionID={digest}
                type={ExplorerLinkType.transaction}
              >
                View on explorer
              </TxLink>
            </p>
          ),
        })
      }, 100)

      navigate('/landing')
    },
    onError: (error) => {
      toast({
        type: 'error',
        message: getSignerOperationErrorMessage(error),
      })
    },
  })

  return (
    <div className="flex flex-col grow items-center font-medium text-sm">
      <div
        className={cl([
          'h-[56px] w-[56px] flex justify-center items-center mb-2',
          !coinInfo && 'bg-[#c4c4c4] text-white rounded-full',
        ])}
      >
        {coinInfo?.icon({ height: 56, width: 56 }) || symbol[0]}
      </div>
      <p className="mb-10 font-bold">{symbol}</p>
      <div className="flex justify-between w-full">
        <span className="text-[#9f9d9d]">Send to</span>
        <span title={formikProps.values.address}>
          {formatAddress(formikProps.values.address || '')}
        </span>
      </div>
      <hr className="border-t border-t-[#c4c4c4] my-4 w-full" />
      <div className="flex justify-between w-full mb-2">
        <span className="text-[#9f9d9d] shrink-0 mr-2">Total value</span>
        <span className="flex shrink truncate">
          <span title={formikProps.values.amount} className="truncate">
            {formikProps.values.amount || '-'}
          </span>
          <span className="ml-1">{symbol}</span>
        </span>
      </div>
      <div className="flex justify-between w-full">
        <span className="text-[#9f9d9d] shrink-0 mr-2">Est. gas fee</span>
        <span className="flex shrink truncate">
          {coinsData ? (
            <Loading loading={isGasLoading}>
              <span>{gasBudget}</span>
            </Loading>
          ) : (
            '-'
          )}
          <span className="ml-1">{GAS_SYMBOL}</span>
        </span>
      </div>
      <div className="grow" />
      <Button
        type="button"
        loading={executeTransfer.isLoading}
        disabled={
          queryResult.isLoading ||
          coinsIsLoading ||
          // suiCoinsIsLoading ||
          isGasLoading
        }
        onClick={() => executeTransfer.mutateAsync()}
      >
        Confirm and Send
      </Button>
    </div>
  )
}

export default SendStepTwo
