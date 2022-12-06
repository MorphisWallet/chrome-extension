// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import Layout from '_app/layouts'
import { Loading, UserApproveContainer } from '_components/index'
import Permissions from './components/permissions'

import { useAppDispatch, useAppSelector, useFormatCoin } from '_hooks'

import { GAS_TYPE_ARG } from '_redux/slices/sui-objects/Coin'
import {
  loadTransactionResponseMetadata,
  respondToTransactionRequest,
  txRequestsSelectors,
  deserializeTxn,
} from '_redux/slices/transaction-requests'
import { thunkExtras } from '_redux/store/thunk-extras'

import type { MetadataGroup } from './types'
import type { SuiMoveNormalizedType, MoveCallTransaction } from '@mysten/sui.js'
import type { RootState } from '_redux/RootReducer'

interface TypeReference {
  address: string
  module: string
  name: string
  type_arguments: SuiMoveNormalizedType[]
}

const TX_CONTEXT_TYPE = '0x2::tx_context::TxContext'

/** Takes a normalized move type and returns the address information contained within it */
function unwrapTypeReference(
  type: SuiMoveNormalizedType
): null | TypeReference {
  if (typeof type === 'object') {
    if ('Struct' in type) {
      return type.Struct
    }
    if ('Reference' in type) {
      return unwrapTypeReference(type.Reference)
    }
    if ('MutableReference' in type) {
      return unwrapTypeReference(type.MutableReference)
    }
    if ('Vector' in type) {
      return unwrapTypeReference(type.Vector)
    }
  }
  return null
}

type TransferSummaryProps = {
  label: string
  content: string | number | null
  loading: boolean
}

const GAS_ESTIMATE_LABEL = 'Estimated Gas Fees'

function TransactionSummery({ label, content, loading }: TransferSummaryProps) {
  const isGasEstimate = label === GAS_ESTIMATE_LABEL
  const [gasEstimate, symbol] = useFormatCoin(
    (isGasEstimate && content) || 0,
    GAS_TYPE_ARG
  )
  const valueContent =
    content === null
      ? '-'
      : isGasEstimate
      ? `${gasEstimate} ${symbol}`
      : content
  return (
    <>
      <div className="">{label}</div>
      <Loading loading={loading}>
        <div className="">{valueContent}</div>
      </Loading>
    </>
  )
}

const TxApprovalPage = () => {
  const { txID } = useParams()

  const [txRequestsLoading, deserializeTxnFailed] = useAppSelector(
    ({ transactionRequests }) => [
      !transactionRequests.initialized,
      transactionRequests.deserializeTxnFailed,
    ]
  )

  const txRequestSelector = useMemo(
    () => (state: RootState) =>
      (txID && txRequestsSelectors.selectById(state, txID)) || null,
    [txID]
  )

  const txRequest = useAppSelector(txRequestSelector)
  const loading = txRequestsLoading
  const dispatch = useAppDispatch()
  const handleOnSubmit = useCallback(
    async (approved: boolean) => {
      if (txRequest) {
        await dispatch(
          respondToTransactionRequest({
            approved,
            txRequestID: txRequest.id,
          })
        )
      }
    },
    [dispatch, txRequest]
  )

  useEffect(() => {
    if (txRequest?.tx?.type === 'move-call' && !txRequest.metadata) {
      dispatch(
        loadTransactionResponseMetadata({
          txRequestID: txRequest.id,
          objectId: txRequest.tx.data.packageObjectId,
          moduleName: txRequest.tx.data.module,
          functionName: txRequest.tx.data.function,
        })
      )
    }

    if (
      txRequest?.tx?.type === 'serialized-move-call' &&
      !txRequest.unSerializedTxn &&
      txRequest?.tx.data
    ) {
      dispatch(
        deserializeTxn({
          serializedTxn: txRequest?.tx.data,
          id: txRequest.id,
        })
      )
    }
  }, [txRequest, dispatch])

  const metadata = useMemo(() => {
    if (
      (txRequest?.tx?.type !== 'move-call' &&
        txRequest?.tx?.type !== 'serialized-move-call' &&
        !txRequest?.unSerializedTxn) ||
      !txRequest?.metadata
    ) {
      return null
    }
    const txData =
      (txRequest?.unSerializedTxn?.data as MoveCallTransaction) ??
      txRequest.tx.data
    const transfer: MetadataGroup = { name: 'Transfer', children: [] }
    const modify: MetadataGroup = { name: 'Modify', children: [] }
    const read: MetadataGroup = { name: 'Read', children: [] }

    txRequest.metadata.parameters.forEach((param, index) => {
      if (typeof param !== 'object') return
      const id = txData?.arguments[index] as string
      const unwrappedType = unwrapTypeReference(param)
      if (!unwrappedType) return

      const groupedParam = {
        id,
        module: `${unwrappedType.address}::${unwrappedType.module}::${unwrappedType.name}`,
      }

      if ('Struct' in param) {
        transfer.children.push(groupedParam)
      } else if ('MutableReference' in param) {
        // Skip TxContext:
        if (groupedParam.module === TX_CONTEXT_TYPE) return
        modify.children.push(groupedParam)
      } else if ('Reference' in param) {
        read.children.push(groupedParam)
      }
    })

    if (
      !transfer.children.length &&
      !modify.children.length &&
      !read.children.length
    ) {
      return null
    }

    return {
      transfer,
      modify,
      read,
    }
  }, [txRequest])

  useEffect(() => {
    if (
      !loading &&
      (!txRequest || (txRequest && txRequest.approved !== null))
    ) {
      window.close()
    }
  }, [loading, txRequest])

  // prevent serialized-move-call from being rendered while deserializing move-call
  const [loadingState, setLoadingState] = useState<boolean>(true)
  useEffect(() => {
    if (
      (!loading && txRequest?.tx.type !== 'serialized-move-call') ||
      (!loading &&
        txRequest?.tx.type === 'serialized-move-call' &&
        (txRequest?.metadata || deserializeTxnFailed))
    ) {
      setLoadingState(false)
    }
  }, [deserializeTxnFailed, loading, txRequest])

  const address = useAppSelector(({ account }) => account.address)
  const txGasEstimationResult = useQuery({
    queryKey: ['tx-request', 'gas-estimate', txRequest?.id, address],
    queryFn: () => {
      if (txRequest) {
        const signer = thunkExtras.api.getSignerInstance(
          thunkExtras.keypairVault.getKeyPair()
        )
        let txToEstimate: Parameters<typeof signer.dryRunTransaction>['0']
        const txType = txRequest.tx.type
        if (txType === 'v2' || txType === 'serialized-move-call') {
          txToEstimate = txRequest.tx.data
        } else {
          txToEstimate = {
            kind: 'moveCall',
            data: txRequest.tx.data,
          }
        }
        return signer.getGasCostEstimation(txToEstimate)
      }
      return Promise.resolve(null)
    },
    enabled: !!(txRequest && address),
  })
  const gasEstimation = txGasEstimationResult.data ?? null
  const valuesContent: {
    label: string
    content: string | number | null
    loading?: boolean
  }[] = useMemo(() => {
    const gasEstimationContent = {
      label: GAS_ESTIMATE_LABEL,
      content: gasEstimation,
      loading: txGasEstimationResult.isLoading,
    }
    switch (txRequest?.tx.type) {
      case 'v2': {
        return [
          {
            label: 'Transaction Type',
            content: txRequest.tx.data.kind,
          },
          gasEstimationContent,
        ]
      }
      case 'move-call':
        return [
          { label: 'Transaction Type', content: 'MoveCall' },
          {
            label: 'Function',
            content: txRequest.tx.data.function,
          },
          gasEstimationContent,
        ]
      case 'serialized-move-call':
        return [
          {
            label: 'Transaction Type',
            content: txRequest?.unSerializedTxn?.kind ?? 'SerializedMoveCall',
          },
          ...(txRequest?.unSerializedTxn
            ? [
                {
                  label: 'Function',
                  content:
                    (txRequest?.unSerializedTxn?.data as MoveCallTransaction)
                      .function ?? '',
                },
                gasEstimationContent,
              ]
            : [
                {
                  label: 'Content',
                  content: txRequest?.tx.data,
                },
                gasEstimationContent,
              ]),
        ]
      default:
        return []
    }
  }, [txRequest, gasEstimation, txGasEstimationResult.isLoading])

  return (
    <Layout showNav={false}>
      <Loading loading={loadingState}>
        {txRequest ? (
          <UserApproveContainer
            origin={txRequest.origin}
            originFavIcon={txRequest.originFavIcon}
            approveTitle="Approve"
            rejectTitle="Reject"
            onSubmit={handleOnSubmit}
            requestType="Approval Request"
          >
            <section className="">
              <div className="">
                <div className="">Transaction summary</div>
                <div className="">
                  {valuesContent.map(({ label, content, loading = false }) => (
                    <div key={label} className="">
                      <TransactionSummery
                        label={label}
                        content={content}
                        loading={loading}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Permissions metadata={metadata} />
            </section>
          </UserApproveContainer>
        ) : null}
      </Loading>
    </Layout>
  )
}

export default TxApprovalPage
