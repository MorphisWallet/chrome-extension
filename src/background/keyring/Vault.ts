// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { v4 as uuidV4 } from 'uuid'

import { encrypt, decrypt } from '_shared/cryptography/keystore'
import {
  entropyToMnemonic,
  entropyToSerialized,
  mnemonicToEntropy,
  toEntropy,
  validateEntropy,
} from '_shared/utils/bip39'

export const LATEST_VAULT_VERSION = 1

export type StoredData = string | { id: string; v: number; data: string }

/**
 * Holds the mnemonic of the wallet and provides functionality to create/encrypt/decrypt it.
 */
export class Vault {
  public readonly entropy: Uint8Array

  public static async from(
    password: string,
    data: StoredData,
    onMigrateCallback?: (vault: Vault) => Promise<void>,
    forceMigrate?: boolean
  ) {
    let entropy: Uint8Array | null = null
    let doMigrate = false
    if (typeof data === 'string') {
      entropy = mnemonicToEntropy(
        Buffer.from(await decrypt<string>(password, data)).toString('utf-8')
      )
      // for encrypted data, do the migration
      doMigrate = true
    } else if (data.v === 1) {
      entropy = toEntropy(await decrypt<string>(password, data.data))
    } else {
      throw new Error(
        "Unknown data, provided data can't be used to create a Vault"
      )
    }
    if (!validateEntropy(entropy)) {
      throw new Error("Can't restore Vault, entropy is invalid.")
    }
    const vault = new Vault(entropy)
    if (
      // to change password, we may force to do the migration
      (doMigrate || forceMigrate) &&
      typeof onMigrateCallback === 'function'
    ) {
      await onMigrateCallback(vault)
    }
    return vault
  }

  constructor(entropy: Uint8Array) {
    this.entropy = entropy
  }

  public async encrypt(password: string, id?: string) {
    return {
      v: LATEST_VAULT_VERSION,
      id: id || uuidV4(),
      data: await encrypt(password, entropyToSerialized(this.entropy)),
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

  public getMnemonic() {
    return entropyToMnemonic(this.entropy)
  }
}
