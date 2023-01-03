// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Ed25519Keypair } from '@mysten/sui.js'
import mitt from 'mitt'
import throttle from 'lodash/throttle'
import Browser from 'webextension-polyfill'

import { VaultStorage } from './VaultStorage'
import { createMessage } from '_messages'
import { isKeyringPayload } from '_payloads/keyring'
import { entropyToSerialized } from '_shared/utils/bip39'
import Alarms from '_src/background/Alarms'
import {
  AUTO_LOCK_TIMER_MAX_MINUTES,
  AUTO_LOCK_TIMER_MIN_MINUTES,
  AUTO_LOCK_TIMER_STORAGE_KEY,
  ALIAS_STORAGE_KEY,
  AVATAR_STORAGE_KEY,
  ACTIVE_WALLET_VAULT_ID,
} from '_src/shared/constants'

import type { Keypair } from '@mysten/sui.js'
import type { Message } from '_messages'
import type { ErrorPayload } from '_payloads'
import type { KeyringPayload } from '_payloads/keyring'
import type { Connection } from '_src/background/connections/Connection'

type KeyringEvents = {
  lockedStatusUpdate: boolean
}

class Keyring {
  #events = mitt<KeyringEvents>()
  #locked = true
  #keypair: Keypair | null = null
  #vault: VaultStorage
  #activeVaultId: string | null = null

  public readonly reviveDone: Promise<void>

  constructor() {
    this.#vault = new VaultStorage()
    this.reviveDone = this.revive().catch(() => {
      // if for some reason decrypting the vault fails or anything else catch
      // the error to allow the user to login using the password
    })
  }

  /**
   * Creates a vault and stores it encrypted to the storage of the extension. It doesn't unlock the vault.
   * @param password The password to encrypt the vault
   * @param importedEntropy The entropy that was generated from an existing mnemonic that the user provided
   * @throws If the wallet exists or any other error during encrypting/saving to storage or if importedEntropy is invalid
   */
  public async createVault(password: string, importedEntropy?: string) {
    const createdVault = await this.#vault.create(password, importedEntropy)
    this.#activeVaultId = createdVault.id
    await Browser.storage.local.set({
      [ACTIVE_WALLET_VAULT_ID]: createdVault.id,
    })
  }

  public async addVault(password: string, importedEntropy?: string) {
    const createdVault = await this.#vault.addVault(password, importedEntropy)
    if (createdVault) {
      this.#activeVaultId = createdVault.id
      await Browser.storage.local.set({
        [ACTIVE_WALLET_VAULT_ID]: createdVault.id,
      })
    }
  }

  public async lock() {
    this.#keypair = null
    this.#locked = true
    await this.#vault.lock()
    await Alarms.clearLockAlarm()
    this.notifyLockedStatusUpdate(this.#locked)
  }

  public async unlock(password: string) {
    await this.#vault.unlock(password, this.#activeVaultId as string)
    this.unlocked()
  }

  public async checkActiveVaultId() {
    if (!this.#activeVaultId) {
      throw new Error('No active vault')
    }
  }

  public async checkPassword(password: string) {
    return await this.#vault.checkPassword(password)
  }

  public async changePassword(args: {
    oldPassword: string
    newPassword: string
  }) {
    this.checkActiveVaultId()
    return await this.#vault.changePassword({
      ...args,
      activeVaultId: this.#activeVaultId as string,
    })
  }

  public async clearVault() {
    this.lock()
    await this.#vault.clear()
  }

  public async isWalletInitialized() {
    return await this.#vault.isWalletInitialized()
  }

  public async setActiveVaultId(vaultId: string) {
    this.#activeVaultId = vaultId
    await Browser.storage.local.set({
      [ACTIVE_WALLET_VAULT_ID]: vaultId,
    })
  }

  public async setAlias(alias: string) {
    this.checkActiveVaultId()

    const allAliases = await this.allAliases
    await Browser.storage.local.set({
      [ALIAS_STORAGE_KEY]: {
        ...allAliases,
        [this.#activeVaultId as string]: alias,
      },
    })
  }

  public async setAvatar(avatar: string) {
    this.checkActiveVaultId()

    const allAvatars = await this.allAvatars
    await Browser.storage.local.set({
      [AVATAR_STORAGE_KEY]: {
        ...allAvatars,
        [this.#activeVaultId as string]: avatar,
      },
    })
  }

  public get isLocked() {
    return this.#locked
  }

  public get keypair() {
    return this.#keypair
  }

  public get entropy() {
    return this.#vault?.entropy
  }

  // sui address always prefixed with 0x
  public get address() {
    if (this.#keypair) {
      let address = this.#keypair.getPublicKey().toSuiAddress()
      if (!address.startsWith('0x')) {
        address = `0x${address}`
      }
      return address
    }
    return null
  }

  public get allAliases(): Promise<Record<string, string>> {
    return (async () =>
      (await Browser.storage.local.get(ALIAS_STORAGE_KEY))[ALIAS_STORAGE_KEY])()
  }

  public get allAvatars(): Promise<Record<string, string>> {
    return (async () =>
      (await Browser.storage.local.get(AVATAR_STORAGE_KEY))[
        AVATAR_STORAGE_KEY
      ])()
  }

  public get activeAlias(): Promise<string | undefined> {
    return (async () => {
      const allAliases = await this.allAliases
      if (!this.#activeVaultId) {
        return undefined
      }
      return allAliases?.[this.#activeVaultId]
    })()
  }

  public get activeAvatar(): Promise<string | undefined> {
    return (async () => {
      const allAvatars = (await Browser.storage.local.get(AVATAR_STORAGE_KEY))[
        AVATAR_STORAGE_KEY
      ]
      if (!this.#activeVaultId) {
        return undefined
      }
      return allAvatars?.[this.#activeVaultId]
    })()
  }

  public get activeVaultId() {
    return this.#activeVaultId
  }

  public on = this.#events.on

  public off = this.#events.off

  public async handleUiMessage(msg: Message, uiConnection: Connection) {
    const { id, payload } = msg
    try {
      if (isKeyringPayload(payload, 'create') && payload.args !== undefined) {
        const { password, importedEntropy } = payload.args
        await this.createVault(password, importedEntropy)
        await this.unlock(password)
        if (!this.#keypair) {
          throw new Error('Error, created vault is empty')
        }
        const allVaults = (await this.#vault.allVaults) || []
        await this.setAlias(`Account${allVaults.length}`)
        uiConnection.send(
          createMessage<KeyringPayload<'create'>>(
            {
              type: 'keyring',
              method: 'create',
              return: {
                keypair: this.#keypair.export(),
                alias: await this.activeAlias,
                avatar: await this.activeAvatar,
              },
            },
            id
          )
        )
      } else if (
        isKeyringPayload(payload, 'add') &&
        payload.args !== undefined
      ) {
        const { password, importedEntropy } = payload.args
        await this.addVault(password, importedEntropy)
        await this.unlock(password)
        if (!this.#keypair) {
          throw new Error('Error, added vault is empty')
        }
        const allVaults = (await this.#vault.allVaults) || []
        await this.setAlias(`Account${allVaults.length}`)
        uiConnection.send(
          createMessage<KeyringPayload<'add'>>(
            {
              type: 'keyring',
              method: 'add',
              return: {
                keypair: this.#keypair.export(),
                alias: await this.activeAlias,
                avatar: await this.activeAvatar,
              },
            },
            id
          )
        )
      } else if (isKeyringPayload(payload, 'getEntropy')) {
        if (this.#locked) {
          throw new Error('Keyring is locked. Unlock it first.')
        }
        if (!this.#activeVaultId) {
          throw new Error('No active vault')
        }
        if (!this.#vault?.entropy) {
          throw new Error('Error vault is empty')
        }
        uiConnection.send(
          createMessage<KeyringPayload<'getEntropy'>>(
            {
              type: 'keyring',
              method: 'getEntropy',
              return: entropyToSerialized(this.#vault.entropy),
            },
            id
          )
        )
      } else if (isKeyringPayload(payload, 'unlock') && payload.args) {
        await this.unlock(payload.args.password)
        uiConnection.send(createMessage({ type: 'done' }, id))
      } else if (isKeyringPayload(payload, 'checkPassword') && payload.args) {
        const res = await this.checkPassword(payload.args)
        uiConnection.send(
          createMessage<KeyringPayload<'checkPassword'>>(
            {
              type: 'keyring',
              method: 'checkPassword',
              return: res,
            },
            id
          )
        )
      } else if (isKeyringPayload(payload, 'changePassword') && payload.args) {
        const res = await this.changePassword(payload.args)
        uiConnection.send(
          createMessage<KeyringPayload<'changePassword'>>(
            {
              type: 'keyring',
              method: 'changePassword',
              return: res,
            },
            id
          )
        )
      } else if (isKeyringPayload(payload, 'walletStatusUpdate')) {
        // wait to avoid ui showing locked and then unlocked screen
        // ui waits until it receives this status to render
        await this.reviveDone
        uiConnection.send(
          createMessage<KeyringPayload<'walletStatusUpdate'>>(
            {
              type: 'keyring',
              method: 'walletStatusUpdate',
              return: {
                isLocked: this.isLocked,
                isInitialized: await this.isWalletInitialized(),
                activeAccount: this.#keypair?.export(),
                alias: await this.activeAlias,
                avatar: await this.activeAvatar,
              },
            },
            id
          )
        )
      } else if (isKeyringPayload(payload, 'lock')) {
        this.lock()
        uiConnection.send(createMessage({ type: 'done' }, id))
      } else if (isKeyringPayload(payload, 'clear')) {
        await this.clearVault()
        uiConnection.send(createMessage({ type: 'done' }, id))
      } else if (isKeyringPayload(payload, 'appStatusUpdate')) {
        const appActive = payload.args?.active
        if (appActive) {
          this.postponeLock()
        }
      } else if (isKeyringPayload(payload, 'setLockTimeout')) {
        if (payload.args) {
          await this.setLockTimeout(payload.args.timeout)
        }
        uiConnection.send(createMessage({ type: 'done' }, id))
      } else if (isKeyringPayload(payload, 'setMeta')) {
        if (payload.args?.alias !== undefined) {
          await this.setAlias(payload.args.alias)
        }
        if (payload.args?.avatar !== undefined) {
          await this.setAvatar(payload.args.avatar)
        }
        uiConnection.send(
          createMessage<KeyringPayload<'setMeta'>>(
            {
              type: 'keyring',
              method: 'setMeta',
              return: {
                alias: await this.activeAlias,
                avatar: await this.activeAvatar,
              },
            },
            id
          )
        )
      }
    } catch (e) {
      uiConnection.send(
        createMessage<ErrorPayload>(
          { code: -1, error: true, message: (e as Error).message },
          id
        )
      )
    }
  }

  private notifyLockedStatusUpdate(isLocked: boolean) {
    this.#events.emit('lockedStatusUpdate', isLocked)
  }

  private postponeLock = throttle(
    async () => {
      if (!this.isLocked) {
        await Alarms.setLockAlarm()
      }
    },
    1000,
    { leading: true }
  )

  private async setLockTimeout(timeout: number) {
    if (
      timeout > AUTO_LOCK_TIMER_MAX_MINUTES ||
      timeout < AUTO_LOCK_TIMER_MIN_MINUTES
    ) {
      return
    }
    await Browser.storage.local.set({
      [AUTO_LOCK_TIMER_STORAGE_KEY]: timeout,
    })
    if (!this.isLocked) {
      await Alarms.setLockAlarm()
    }
  }

  private async revive() {
    const unlocked = await this.#vault.revive()
    if (unlocked) {
      this.unlocked()
    }
  }

  private unlocked() {
    let mnemonic = this.#vault.getMnemonic()
    if (!mnemonic) {
      return
    }
    Alarms.setLockAlarm()
    this.#keypair = Ed25519Keypair.deriveKeypair(mnemonic)
    mnemonic = null
    this.#locked = false
    this.notifyLockedStatusUpdate(this.#locked)
  }
}

export default new Keyring()
