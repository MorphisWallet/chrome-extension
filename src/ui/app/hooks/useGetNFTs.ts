// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useGetOwnedObjects } from '_src/ui/core/hooks/useGetOwnedObjects'
import { useGetOriginByteKioskContents } from '_src/ui/core/hooks/useGetOriginByteKioskContents'
import { hasDisplayData } from '_src/ui/core/utils/hasDisplayData'
import useAppSelector from './useAppSelector'

import type { SuiObjectData, SuiAddress } from '@mysten/sui.js'

export function useGetNFTs(address?: SuiAddress | null) {
  const {
    data,
    isLoading,
    error,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isInitialLoading,
  } = useGetOwnedObjects(
    address,
    {
      MatchNone: [{ StructType: '0x2::coin::Coin' }],
    },
    50
  )
  const { apiEnv } = useAppSelector((state) => state.app)

  const shouldFetchKioskContents = apiEnv === 'mainnet'
  const { data: obKioskContents, isLoading: areKioskContentsLoading } =
    useGetOriginByteKioskContents(address, !shouldFetchKioskContents)

  const filteredKioskContents =
    obKioskContents
      ?.filter(hasDisplayData)
      .map(({ data }) => data as SuiObjectData) || []

  const nfts = [
    ...filteredKioskContents,
    ...(data?.pages
      .flatMap((page) => page.data)
      .filter(hasDisplayData)
      .map(({ data }) => data as SuiObjectData) || []),
  ]

  return {
    data: nfts,
    isInitialLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading:
      isLoading || (shouldFetchKioskContents && areKioskContentsLoading),
    isError: isError,
    error,
  }
}
