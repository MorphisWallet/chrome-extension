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

type AccountMetaMap = Map<SuiAddress, AccountMeta>

const genRandomAvatarColor = () =>
  DEFAULT_AVATAR_COLOR_POOL[
    Math.floor(Math.random() * DEFAULT_AVATAR_COLOR_POOL.length)
  ] as HexColor

export class Meta {
  public static async init() {
    await setToLocalStorage<AccountMetaMap>(META_KEY, new Map())
  }

  public static async getAllMeta() {
    const allMeta = await getFromLocalStorage<AccountMetaMap>(META_KEY)
    if (!allMeta) {
      await this.init()
    }
    return allMeta as AccountMetaMap
  }

  public static async getMetaByAddress(address: string) {
    const allMeta = await this.getAllMeta()
    if (!allMeta) {
      throw new Error('Failed to load account meta')
    }
    return allMeta?.get(address)
  }

  public static async addDefaultMeta(address: SuiAddress) {
    const allMeta = await this.getAllMeta()
    if (!allMeta) {
      throw new Error('Failed to load account meta')
    }
    allMeta.set(address, {
      alias: `Account ${allMeta.size + 1}`,
      avatar: genRandomAvatarColor(),
    })
  }

  public static async updateMeta(
    address: SuiAddress,
    meta: Partial<AccountMeta>
  ) {
    const allMeta = await this.getAllMeta()
    if (!allMeta) {
      throw new Error('Failed to load account meta')
    }

    const currentMeta = allMeta.get(address)
    if (!currentMeta) {
      throw new Error('Failed to load account meta')
    }

    allMeta.set(address, {
      alias: meta?.alias || currentMeta.alias,
      avatar: meta?.avatar || currentMeta.avatar,
    })
  }

  public static async clearMeta() {
    const allMeta = await this.getAllMeta()
    allMeta?.clear()
  }
}
