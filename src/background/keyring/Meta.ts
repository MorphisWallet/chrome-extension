import { getFromLocalStorage, setToLocalStorage } from '../storage-utils'

import type { SuiAddress } from '@mysten/sui.js'

type Base64Image = `data:image/${
  | 'png'
  | 'gif'
  | 'jpg'
  | 'jpeg'};base64${string}`

type HexColor = `#${string}`

type Avatar = Base64Image | HexColor

const META_KEY = 'meta'

const DEFAULT_AVATAR_COLOR_POOL = [
  '#BEF9FF',
  '#FFF3EC',
  '#82FFAC',
  '#E3C8F3',
  '#FEBBA8',
  '#000000',
  '#FFFFFF',
  '#FFFFC7',
  '#3FFFE4',
  '#9B72F3',
]

type AccountMeta = {
  alias: string
  avatar: Avatar
}

export type AccountsMeta = Record<SuiAddress, AccountMeta>

const genRandomAvatarColor = () =>
  DEFAULT_AVATAR_COLOR_POOL[
    Math.floor(Math.random() * DEFAULT_AVATAR_COLOR_POOL.length)
  ] as HexColor

export const initMeta = async () => {
  await setToLocalStorage<AccountsMeta>(META_KEY, {})
}

export const getAllMeta = async () => {
  const allMeta = await getFromLocalStorage<AccountsMeta>(META_KEY)
  if (!allMeta) {
    await initMeta()
  }
  return allMeta as AccountsMeta
}

export const getMetaByAddress = async (address: SuiAddress) => {
  const allMeta = await getAllMeta()
  return allMeta[address]
}

export const setMetaByAddress = async (
  address: SuiAddress,
  meta?: Partial<AccountMeta>
) => {
  const allMeta = await getAllMeta()
  // localStorage is read-only and immutable, clone a new map to overwrite previous allMeta
  const clonedAllMeta = { ...allMeta }
  const addressMeta = clonedAllMeta[address]
  clonedAllMeta[address] = {
    alias:
      meta?.alias ||
      addressMeta?.alias ||
      `Account ${Object.keys(clonedAllMeta).length + 1}`,
    avatar: meta?.avatar || addressMeta?.avatar || genRandomAvatarColor(),
  }
  await setToLocalStorage<AccountsMeta>(META_KEY, clonedAllMeta)
}

export const clearAllMeta = async () => {
  await setToLocalStorage(META_KEY, null)
}
