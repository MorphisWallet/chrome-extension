// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { getObjectDisplay } from '@mysten/sui.js'
import { useMemo } from 'react'

import { useGetObject } from './useGetObject'

export type NFTMetadata = {
  name: string | null
  description: string | null
  url: string
}

export function useGetNFTMeta(objectID: string) {
  const resp = useGetObject(objectID)
  const nftMeta = useMemo(() => {
    if (!resp.data) return null
    const display = getObjectDisplay(resp.data)
    if (!display.data) {
      return null
    }
    const { name, description, creator, image_url, link, project_url, kiosk } =
      display.data
    return {
      name: name || null,
      description: description || null,
      imageUrl: image_url || null,
      link: link || null,
      projectUrl: project_url || null,
      creator: creator || null,
      kiosk: kiosk || null,
    }
  }, [resp])
  return {
    ...resp,
    data: nftMeta,
  }
}
