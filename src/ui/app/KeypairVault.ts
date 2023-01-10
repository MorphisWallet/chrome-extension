// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Ed25519Keypair } from '@mysten/sui.js'

import { getKeypairFromMnemonics } from '_src/shared/cryptography/bip39'

export default class KeypairVault {
  private _activeIndex = 0
  private _mnemonic = ''
  private _keypairs: Record<string, Ed25519Keypair> | null = null

  public set mnemonic(mnemonic: string) {
    this._mnemonic = mnemonic
    if (!this._keypairs) {
      this._keypairs = {}
    }
  }

  public set activeIndex(index: number) {
    this._activeIndex = index
  }

  public addKeyPair(index: number): Ed25519Keypair {
    if (!this._keypairs) {
      throw new Error('Account mnemonic is not set')
    }

    const key = index.toString()
    const keypair = getKeypairFromMnemonics(this._mnemonic, index)

    this._keypairs[key] = keypair
    return keypair
  }

  public getKeyPair(index?: number) {
    if (!this._keypairs) {
      throw new Error('Account mnemonic is not set')
    }

    if (index === undefined) {
      index = this._activeIndex
    } else {
      this._activeIndex = index
    }

    const key = index.toString()
    let keypair = this._keypairs[key]
    if (!keypair) {
      keypair = this.addKeyPair(index)
    }
    return keypair
  }

  public getAddress(index?: number): string | null {
    if (!this._keypairs) {
      throw new Error('Account mnemonic is not set')
    }

    if (index === undefined) {
      index = this._activeIndex
    } else {
      this._activeIndex = index
    }

    const keypair = this.getKeyPair(index)
    let address = keypair.getPublicKey().toSuiAddress() || null
    if (address && !address.startsWith('0x')) {
      address = `0x${address}`
    }
    return address
  }

  public clear() {
    this._activeIndex = 0
    this._mnemonic = ''
    this._keypairs = null
  }
}
