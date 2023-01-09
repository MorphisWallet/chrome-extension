// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Ed25519Keypair } from '@mysten/sui.js'

import { encrypt, decrypt } from '_shared/cryptography/keystore'
import {
  entropyToMnemonic,
  entropyToSerialized,
  mnemonicToEntropy,
  toEntropy,
  validateEntropy,
} from '_shared/cryptography/bip39'

export const LATEST_VAULT_VERSION = 1

export type StoredData = {
  id: string // use public key as vaultId
  v: number
  data: string // encrypted entropy (for local storage)
  avatar?: string
  alias?: string
}

/**
 * Holds the mnemonic of the wallet and provides functionality to create/encrypt/decrypt it.
 */
export class Vault {
  public readonly entropy: Uint8Array
  public readonly id: string
  public avatar?: string
  public alias?: string
  #keypair: Ed25519Keypair

  public static async from(
    password: string,
    vault: StoredData,
    onMigrateCallback?: (vault: Vault) => Promise<void>,
    forceMigrate?: boolean,
    meta?: { alias?: string; avatar?: string }
  ) {
    let entropy: Uint8Array | null = null
    let doMigrate = false
    if (typeof vault === 'string') {
      entropy = mnemonicToEntropy(
        Buffer.from(await decrypt<string>(password, vault)).toString('utf-8')
      )
      // for encrypted data, do the migration
      doMigrate = true
    } else if (vault.v === 1) {
      entropy = toEntropy(await decrypt<string>(password, vault.data))
    } else {
      throw new Error(
        "Unknown data, provided data can't be used to create a Vault"
      )
    }
    if (!validateEntropy(entropy)) {
      throw new Error("Can't restore Vault, entropy is invalid.")
    }
    const newVault = new Vault(
      entropy,
      meta || { alias: vault.alias, avatar: vault.avatar }
    )
    if (
      // to change password, we may force to do the migration
      (doMigrate || forceMigrate) &&
      typeof onMigrateCallback === 'function'
    ) {
      await onMigrateCallback(newVault)
    }
    return newVault
  }

  constructor(entropy: Uint8Array, meta?: { alias?: string; avatar?: string }) {
    this.entropy = entropy

    const mnemonic = this.getMnemonic(entropy)
    const keypair = Ed25519Keypair.deriveKeypair(mnemonic)
    this.#keypair = keypair
    this.id = keypair.getPublicKey().toSuiAddress()

    this.alias = meta?.alias
    this.avatar = meta?.avatar
  }

  public async encrypt(password: string, id?: string): Promise<StoredData> {
    return {
      v: LATEST_VAULT_VERSION,
      id: id || this.id,
      data: await encrypt(password, entropyToSerialized(this.entropy)),
      avatar: this.avatar,
      alias: this.alias,
    }
  }

  // only try to decrypt and check the password
  public async decrypt(password: string, data: StoredData): Promise<boolean> {
    try {
      // try to decrypt serialized entropy. wrong password will throw an error
      if (typeof data === 'string') {
        await decrypt<string>(password, data)
      } else if (data.v === 1) {
        await decrypt<string>(password, data.data)
      } else {
        throw new Error("Unknown data, provided data can't be used to decrypt")
      }
      return true
    } catch (e) {
      return false
    }
  }

  // decrypt and return the decrypted data
  public static async reveal(
    password: string,
    data: StoredData
  ): Promise<string | null> {
    try {
      if (typeof data === 'string') {
        return await decrypt<string>(password, data)
      } else if (data.v === 1) {
        return await decrypt<string>(password, data.data)
      } else {
        throw new Error("Unknown data, provided data can't be used to decrypt")
      }
    } catch (e) {
      return null
    }
  }

  public setMeta({ avatar, alias }: { avatar?: string; alias?: string }) {
    this.avatar = avatar || this.avatar
    this.alias = alias || this.alias
  }

  public getMnemonic(entropy?: Uint8Array) {
    return entropyToMnemonic(entropy || this.entropy)
  }

  public get keypair() {
    return this.#keypair
  }
}
