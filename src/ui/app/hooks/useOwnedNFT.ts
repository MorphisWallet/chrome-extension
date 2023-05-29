// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react'
import {
  is,
  SuiObjectData,
  getObjectOwner,
  type SuiAddress,
} from '@mysten/sui.js'

import { useGetObject } from './useGetObject'
import { useGetOriginByteKioskContents } from '_src/ui/core/hooks/useGetOriginByteKioskContents'

export function useOwnedNFT(
  nftObjectId: string | null,
  address: SuiAddress | null
) {
  const data = useGetObject(nftObjectId)
  const { data: kioskContents } = useGetOriginByteKioskContents(address)
  const { data: objectData } = data
  const objectDetails = useMemo(() => {
    if (!objectData || !is(objectData.data, SuiObjectData) || !address)
      return null
    const ownedKioskObjectIds =
      kioskContents?.map(({ data }) => data?.objectId) || []
    const objectOwner = getObjectOwner(objectData)
    const isOwner =
      ownedKioskObjectIds.includes(objectData.data.objectId) ||
      (objectOwner &&
        objectOwner !== 'Immutable' &&
        'AddressOwner' in objectOwner &&
        objectOwner.AddressOwner === address)
        ? objectData.data
        : null
    return isOwner
  }, [address, objectData, kioskContents])
  return { ...data, data: objectDetails }
}
