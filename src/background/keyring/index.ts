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
} from '_src/shared/constants'

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
  #vaultStorage: VaultStorage

  public readonly reviveDone: Promise<void>

  constructor() {
    this.#vaultStorage = new VaultStorage()
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
    await this.#vaultStorage.create(password, importedEntropy)
  }

  public async addVault(importedEntropy?: string) {
    await this.#vaultStorage.addVault(importedEntropy)
  }

  public async lock() {
    this.#locked = true
    await this.#vaultStorage.lock()
    await Alarms.clearLockAlarm()
    this.notifyLockedStatusUpdate(this.#locked)
  }

  public async unlock(password?: string) {
    await this.#vaultStorage.unlock(password)
    this.unlocked()
  }

  public async checkPassword(password: string) {
    return await this.#vaultStorage.checkPassword(password)
  }

  public async changePassword(args: {
    oldPassword: string
    newPassword: string
  }) {
    return await this.#vaultStorage.changePassword(args)
  }

  public async setActiveAccount(id: string) {
    return await this.#vaultStorage.setActiveAccount(id)
  }

  public async clearVault() {
    this.lock()
    await this.#vaultStorage.clear()
  }

  public async isWalletInitialized() {
    return await this.#vaultStorage.isWalletInitialized()
  }

  public async setMeta(meta: { alias?: string; avatar?: string }) {
    await this.#vaultStorage.setMeta(meta)
  }

  public get meta() {
    return this.#vaultStorage.meta
  }

  public get isLocked() {
    return this.#locked
  }

  public get keypair() {
    return this.#vaultStorage.keypair
  }

  public get entropy() {
    return this.#vaultStorage.entropy
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

        const keypair = this.#vaultStorage.keypair
        if (!keypair) {
          throw new Error('Error, created vault is empty')
        }

        uiConnection.send(
          createMessage<KeyringPayload<'create'>>(
            {
              type: 'keyring',
              method: 'create',
              return: {
                keypair: (keypair as Ed25519Keypair).export(),
                ...this.#vaultStorage.meta,
              },
            },
            id
          )
        )
      } else if (
        isKeyringPayload(payload, 'add') &&
        payload.args !== undefined
      ) {
        const { importedEntropy } = payload.args
        await this.addVault(importedEntropy)
        await this.unlock()

        const keypair = this.#vaultStorage.keypair
        if (!keypair) {
          throw new Error('Error, added vault is empty')
        }

        uiConnection.send(
          createMessage<KeyringPayload<'add'>>(
            {
              type: 'keyring',
              method: 'add',
              return: {
                keypair: (keypair as Ed25519Keypair).export(),
                ...this.#vaultStorage.meta,
              },
            },
            id
          )
        )
      } else if (isKeyringPayload(payload, 'getEntropy')) {
        if (this.#locked) {
          throw new Error('Keyring is locked. Unlock it first.')
        }
        if (!(await this.#vaultStorage.getActiveVaultId())) {
          throw new Error('No active vault')
        }
        if (!this.#vaultStorage?.entropy) {
          throw new Error('Error vault is empty')
        }

        uiConnection.send(
          createMessage<KeyringPayload<'getEntropy'>>(
            {
              type: 'keyring',
              method: 'getEntropy',
              return: entropyToSerialized(this.#vaultStorage.entropy),
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
                activeAccount: this.#vaultStorage.keypair?.export(),
                ...this.#vaultStorage.meta,
              },
            },
            id
          )
        )
      } else if (
        isKeyringPayload(payload, 'setActiveAccount') &&
        payload.args
      ) {
        await this.setActiveAccount(payload.args.id)

        const keypair = this.#vaultStorage.keypair
        if (!keypair) {
          throw new Error('Error, added vault is empty')
        }

        uiConnection.send(
          createMessage<KeyringPayload<'setActiveAccount'>>(
            {
              type: 'keyring',
              method: 'setActiveAccount',
              return: {
                keypair: (keypair as Ed25519Keypair).export(),
                alias: '',
                avatar: '',
              },
            },
            id
          )
        )
      } else if (isKeyringPayload(payload, 'allAccounts')) {
        const accounts = (await this.#vaultStorage.allVaults) || []
        uiConnection.send(
          createMessage<KeyringPayload<'allAccounts'>>(
            {
              type: 'keyring',
              method: 'allAccounts',
              return: accounts.map((_account) => ({
                id: _account.id,
                alias: _account.alias,
                avatar: _account.avatar,
              })),
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
        await this.setMeta(payload.args || {})
        uiConnection.send(
          createMessage<KeyringPayload<'setMeta'>>(
            {
              type: 'keyring',
              method: 'setMeta',
              return: {
                ...this.#vaultStorage.meta,
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
    const unlocked = await this.#vaultStorage.revive()
    if (unlocked) {
      this.unlocked()
    }
  }

  private unlocked() {
    const mnemonic = this.#vaultStorage.getMnemonic()
    if (!mnemonic) {
      return
    }
    Alarms.setLockAlarm()
    this.#locked = false
    this.notifyLockedStatusUpdate(this.#locked)
  }
}

export default new Keyring()
