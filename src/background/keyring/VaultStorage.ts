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

export class VaultStorage {
  #vault: Vault | null = null // the vault with active vaultId

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
      importedEntropy ? toEntropy(importedEntropy) : getRandomEntropy()
    )
    const encryptedVault = await vault.encrypt(password)
    await setToStorage(LOCAL_STORAGE, VAULT_KEY, [encryptedVault])

    return encryptedVault
  }

  public async addVault(password: string, importedEntropy?: string) {
    if (!(await this.isWalletInitialized())) {
      throw new Error(
        'Vault is not initialized. If you want to have multiple wallets, initialize the vault first'
      )
    }

    const res = await this.checkPassword(password)

    if (res) {
      const encryptedVaults = await getFromStorage<StoredData[]>(
        LOCAL_STORAGE,
        VAULT_KEY
      )
      const newVault = new Vault(
        importedEntropy ? toEntropy(importedEntropy) : getRandomEntropy()
      )
      const encryptedVault = await newVault.encrypt(password)

      await setToStorage(LOCAL_STORAGE, VAULT_KEY, [
        ...(encryptedVaults || []),
        encryptedVault,
      ])

      return encryptedVault
    }
  }

  public async unlock(password: string, vaultId?: string) {
    const encryptedVaults = await getFromStorage<StoredData[]>(
      LOCAL_STORAGE,
      VAULT_KEY
    )
    if (!encryptedVaults) {
      throw new Error('Wallet is not initialized. Create a new one first.')
    }

    const vaultIdToUnlock =
      vaultId ||
      (await Browser.storage.local.get(ACTIVE_WALLET_VAULT_ID))[
        ACTIVE_WALLET_VAULT_ID
      ]

    if (vaultIdToUnlock) {
      const objectVaults: Exclude<StoredData, string>[] =
        encryptedVaults.filter(
          (_vault) => typeof _vault === 'object'
        ) as Exclude<StoredData, string>[]
      const targetVault = objectVaults.find(
        (_vault: Exclude<StoredData, string>) => _vault.id === vaultIdToUnlock
      )

      if (!targetVault) {
        throw new Error(`No vault with id ${vaultIdToUnlock} was found`)
      }

      this.#vault = await Vault.from(password, targetVault, async (aVault) =>
        setToStorage(LOCAL_STORAGE, VAULT_KEY, [
          ...(encryptedVaults || []),
          await aVault.encrypt(password),
        ])
      )
    } else {
      throw new Error(`No vault with id ${vaultIdToUnlock} was found`)
    }

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
    activeVaultId,
  }: {
    oldPassword: string
    newPassword: string
    activeVaultId: string
  }) {
    const encryptedVaults = await getFromStorage<StoredData[]>(
      LOCAL_STORAGE,
      VAULT_KEY
    )
    if (!encryptedVaults) {
      throw new Error('Wallet is not initialized. Create a new one first.')
    }

    const objectVaults: Exclude<StoredData, string>[] = encryptedVaults.filter(
      (_vault) => typeof _vault === 'object'
    ) as Exclude<StoredData, string>[]
    const targetVault = objectVaults.find(
      (_vault: Exclude<StoredData, string>) => _vault.id === activeVaultId
    )

    if (!targetVault) {
      throw new Error(`No vault with id ${activeVaultId} was found`)
    }

    this.#vault = await Vault.from(
      oldPassword,
      targetVault
      // async (aVault) =>
      //   setToStorage(
      //     LOCAL_STORAGE,
      //     VAULT_KEY,
      //     await aVault.encrypt(newPassword)
      //   ),
      // true
    )

    const revealedVaults = await Promise.all(
      objectVaults.map(async (_vault) => ({
        entropy: await Vault.reveal(oldPassword, _vault),
        id: _vault.id,
      }))
    )
    console.log(111, revealedVaults)

    if (revealedVaults.some((_vault) => !_vault.entropy)) {
      throw new Error('Some vaults have unknown entropy')
    }

    const newlyEncryptedVault = await Promise.all(
      revealedVaults.map(
        async (_vault) =>
          await new Vault(toEntropy(_vault.entropy as string)).encrypt(
            newPassword,
            _vault.id
          )
      )
    )
    console.log(222, newlyEncryptedVault)
    await setToStorage(LOCAL_STORAGE, VAULT_KEY, newlyEncryptedVault)

    return true
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
    await setToStorage(LOCAL_STORAGE, VAULT_KEY, null)
  }

  public async isWalletInitialized() {
    return !!(await getFromStorage<StoredData[]>(LOCAL_STORAGE, VAULT_KEY))
  }

  public getMnemonic() {
    return this.#vault?.getMnemonic() || null
  }

  public get allVaults() {
    return (async () =>
      await getFromStorage<StoredData[]>(LOCAL_STORAGE, VAULT_KEY))()
  }

  public get entropy() {
    return this.#vault?.entropy || null
  }
}
