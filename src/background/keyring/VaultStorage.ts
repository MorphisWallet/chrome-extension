// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { randomBytes } from '@noble/hashes/utils'
import Browser from 'webextension-polyfill'

import { Vault } from './Vault'
import { getRandomEntropy, toEntropy } from '_shared/utils/bip39'
import { ACTIVE_WALLET_VAULT_ID } from '_src/shared/constants'

import type { StoredData } from './Vault'
import type { Storage } from 'webextension-polyfill'

export const IS_SESSION_STORAGE_SUPPORTED = 'chrome' in global
const SESSION_STORAGE: Storage.LocalStorageArea | null =
  // @ts-expect-error chrome
  IS_SESSION_STORAGE_SUPPORTED ? global.chrome.storage.session : null
const LOCAL_STORAGE = Browser.storage.local

// we use this password + a random one for each time we store the encrypted
// vault to session storage
const PASSWORD = process.env.WALLET_KEYRING_PASSWORD || ''
const VAULT_KEY = 'morphis_vault'
const EPHEMERAL_PASSWORD_KEY = process.env.EPHEMERAL_PASSWORD_KEY || ''
const EPHEMERAL_VAULT_KEY = process.env.EPHEMERAL_VAULT_KEY || ''

if (!PASSWORD || !EPHEMERAL_PASSWORD_KEY || !EPHEMERAL_VAULT_KEY) {
  throw new Error(
    `Failed to initialize vault storage. Contact morphis via our twitter or discord`
  )
}

async function getFromStorage<T>(
  storage: Storage.LocalStorageArea,
  key: string
): Promise<T | null> {
  return (await storage.get({ [key]: null }))[key]
}

async function setToStorage<T>(
  storage: Storage.LocalStorageArea,
  key: string,
  value: T
): Promise<void> {
  return await storage.set({ [key]: value })
}

async function ifSessionStorage(
  execFN: (sessionStorage: Storage.LocalStorageArea) => Promise<void>
) {
  if (SESSION_STORAGE) {
    return execFN(SESSION_STORAGE)
  }
}

function getRandomPassword() {
  return Buffer.from(randomBytes(64)).toString('hex')
}

function makeEphemeraPassword(rndPass: string) {
  if (!PASSWORD) {
    throw new Error(
      'Failed to make ephemeral password as no PASSWORD is provided'
    )
  }
  return `${PASSWORD}${rndPass}`
}

const genRandomHexColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`

export class VaultStorage {
  #vault: Vault | null = null // the vault with active vaultId
  #cachedPwd: string | null = null

  /**
   * See {@link Keyring.createVault}
   * @param password
   * @param importedEntropy
   */
  public async create(password: string, importedEntropy?: string) {
    if (await this.isWalletInitialized()) {
      throw new Error(
        'Vault is already initialized. If you want to have multiple wallets, use addVault instead'
      )
    }
    const vault = new Vault(
      importedEntropy ? toEntropy(importedEntropy) : getRandomEntropy(),
      { alias: 'Account1', avatar: genRandomHexColor() }
    )
    const encryptedVault = await vault.encrypt(password)
    await setToStorage(LOCAL_STORAGE, VAULT_KEY, [encryptedVault])
    await this.setActiveVaultId(encryptedVault.id)
    this.#cachedPwd = password

    return encryptedVault
  }

  public async addVault(importedEntropy?: string) {
    if (!(await this.isWalletInitialized())) {
      throw new Error(
        'Vault is not initialized. If you want to have multiple wallets, initialize the vault first'
      )
    }

    const encryptedVaults =
      (await getFromStorage<StoredData[]>(LOCAL_STORAGE, VAULT_KEY)) || []
    const newVault = new Vault(
      importedEntropy ? toEntropy(importedEntropy) : getRandomEntropy(),
      {
        alias: `Account${encryptedVaults.length + 1}`,
        avatar: genRandomHexColor(),
      }
    )
    const cachedPwd = this.#cachedPwd
    if (!cachedPwd) {
      throw new Error('Password cache failed')
    }

    await this.checkPassword(cachedPwd)

    const encryptedVault = await newVault.encrypt(cachedPwd)

    await setToStorage(LOCAL_STORAGE, VAULT_KEY, [
      ...encryptedVaults,
      encryptedVault,
    ])
    await this.setActiveVaultId(encryptedVault.id)

    return encryptedVault
  }

  public async unlock(password?: string) {
    if (!password && !this.#cachedPwd) {
      throw new Error('No password is provided or cached')
    }

    const activeVault = await this.getVaultById()

    this.#vault = await Vault.from(
      password || (this.#cachedPwd as string),
      activeVault,
      undefined,
      undefined,
      { alias: activeVault.alias, avatar: activeVault.avatar }
    )
    this.#cachedPwd = password || this.#cachedPwd

    await ifSessionStorage(async (sessionStorage) => {
      if (!this.#vault) {
        return
      }
      const rndPass = getRandomPassword()
      const ephemeralPass = makeEphemeraPassword(rndPass)
      await setToStorage(sessionStorage, EPHEMERAL_PASSWORD_KEY, rndPass)
      await setToStorage(
        sessionStorage,
        EPHEMERAL_VAULT_KEY,
        await this.#vault.encrypt(ephemeralPass)
      )
    })
  }

  public async lock() {
    this.#vault = null
    this.#cachedPwd = null
    await ifSessionStorage(async (sessionStorage) => {
      await setToStorage(sessionStorage, EPHEMERAL_PASSWORD_KEY, null)
      await setToStorage(sessionStorage, EPHEMERAL_VAULT_KEY, null)
    })
  }

  public async checkPassword(password: string) {
    const encryptedVaults = await getFromStorage<StoredData[]>(
      LOCAL_STORAGE,
      VAULT_KEY
    )
    if (!encryptedVaults) {
      throw new Error('Wallet is not initialized. Create a new one first.')
    }
    // all vaults share the same password, use first one to check
    const res = await this.#vault?.decrypt(password, encryptedVaults[0])
    return !!res
  }

  public async changePassword({
    oldPassword,
    newPassword,
  }: {
    oldPassword: string
    newPassword: string
  }) {
    const encryptedVaults = await getFromStorage<StoredData[]>(
      LOCAL_STORAGE,
      VAULT_KEY
    )
    if (!encryptedVaults) {
      throw new Error('Wallet is not initialized. Create a new one first.')
    }

    try {
      const revealedVaults = await Promise.all(
        encryptedVaults.map(async (_vault) => ({
          entropy: await Vault.reveal(oldPassword, _vault),
          id: _vault.id,
          alias: _vault.alias,
          avatar: _vault.avatar,
        }))
      )

      if (revealedVaults.some((_vault) => !_vault.entropy)) {
        throw new Error('Some vaults have unknown entropy')
      }

      const newlyEncryptedVault = await Promise.all(
        revealedVaults.map(
          async (_vault) =>
            await new Vault(toEntropy(_vault.entropy as string), {
              alias: _vault.alias,
              avatar: _vault.avatar,
            }).encrypt(newPassword, _vault.id)
        )
      )
      await setToStorage(LOCAL_STORAGE, VAULT_KEY, newlyEncryptedVault)
      this.#cachedPwd = newPassword
    } catch (e) {
      throw new Error('Password does not match')
    }
  }

  public async revive(): Promise<boolean> {
    let unlocked = false
    await ifSessionStorage(async (sessionStorage) => {
      const rndPass = await getFromStorage<string>(
        sessionStorage,
        EPHEMERAL_PASSWORD_KEY
      )
      if (rndPass) {
        const ephemeralPass = makeEphemeraPassword(rndPass)
        const ephemeralEncryptedVault = await getFromStorage<StoredData>(
          sessionStorage,
          EPHEMERAL_VAULT_KEY
        )
        if (ephemeralEncryptedVault) {
          this.#vault = await Vault.from(ephemeralPass, ephemeralEncryptedVault)
          unlocked = true
        }
      }
    })
    return unlocked
  }

  public async clear() {
    await this.lock()
    this.#cachedPwd = null
  }

  public async isWalletInitialized() {
    return !!(await getFromStorage<StoredData[]>(LOCAL_STORAGE, VAULT_KEY))
  }

  public getMnemonic() {
    return this.#vault?.getMnemonic() || null
  }

  public getCachedPassword() {
    return this.#cachedPwd
  }

  public async getActiveVaultId() {
    return await getFromStorage<string>(LOCAL_STORAGE, ACTIVE_WALLET_VAULT_ID)
  }

  // if no id is specified, it means to get active vault
  public async getVaultById(vaultId?: string) {
    const encryptedVaults = await getFromStorage<StoredData[]>(
      LOCAL_STORAGE,
      VAULT_KEY
    )
    if (!encryptedVaults) {
      throw new Error('Wallet is not initialized. Create a new one first.')
    }

    const _vaultId = vaultId || (await this.getActiveVaultId())

    const targetVault = encryptedVaults.find(
      (_vault: Exclude<StoredData, string>) => _vault.id === _vaultId
    )
    if (!targetVault) {
      throw new Error(
        vaultId ? `No vault with id ${vaultId} is found` : 'No active vault'
      )
    }

    return targetVault
  }

  public async setActiveVaultId(id: string) {
    await Browser.storage.local.set({
      [ACTIVE_WALLET_VAULT_ID]: id,
    })
  }

  public async setActiveAccount(id: string) {
    const encryptedVaults = await getFromStorage<StoredData[]>(
      LOCAL_STORAGE,
      VAULT_KEY
    )
    if (!encryptedVaults) {
      throw new Error('Wallet is not initialized. Create a new one first.')
    }

    const targetVault = encryptedVaults.find(
      (_vault: Exclude<StoredData, string>) => _vault.id === id
    )
    if (!targetVault) {
      throw new Error(`No vault with id ${id} is found`)
    }

    if (!this.#cachedPwd) {
      throw new Error('No password is provided or cached')
    }

    this.#vault = await Vault.from(this.#cachedPwd, targetVault)
    await this.setActiveVaultId(id)
  }

  public async setMeta(
    meta: { avatar?: string; alias?: string },
    vaultId?: string
  ) {
    // update #vault object
    if (!vaultId) {
      this.#vault?.setMeta(meta)
    }

    // update vault in storage
    const encryptedVaults = await getFromStorage<StoredData[]>(
      LOCAL_STORAGE,
      VAULT_KEY
    )
    if (!encryptedVaults) {
      throw new Error('Wallet is not initialized. Create a new one first.')
    }

    const _vaultId = vaultId || (await this.getActiveVaultId())

    const updatedVaults = encryptedVaults.map((_vault) =>
      _vault.id === _vaultId ? { ..._vault, ...meta } : _vault
    )

    await setToStorage(LOCAL_STORAGE, VAULT_KEY, updatedVaults)
  }

  public get allVaults() {
    return (async () =>
      await getFromStorage<StoredData[]>(LOCAL_STORAGE, VAULT_KEY))()
  }

  public get entropy() {
    return this.#vault?.entropy || null
  }

  public get keypair() {
    return this.#vault?.keypair
  }

  public get meta() {
    return {
      alias: this.#vault?.alias,
      avatar: this.#vault?.avatar,
    }
  }
}
