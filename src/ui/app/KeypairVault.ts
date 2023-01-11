// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Ed25519Keypair } from '@mysten/sui.js'

import { getKeypairFromMnemonics } from '_src/shared/cryptography/bip39'

export default class KeypairVault {
  #mnemonic = ''
  #activeIndex = 0
  #keypairs: Record<string, Ed25519Keypair> | null = null

  get mnemonic() {
    return this.#mnemonic
  }

  set mnemonic(mnemonic: string) {
    this.#mnemonic = mnemonic
  }

  set activeIndex(index: number) {
    this.#activeIndex = index
  }

  public addKeyPair(index: number): Ed25519Keypair {
    if (!this.#keypairs) {
      throw new Error('Account mnemonic is not set')
    }

    const key = index.toString()
    const keypair = getKeypairFromMnemonics(this.#mnemonic, index)

    this.#keypairs[key] = keypair
    return keypair
  }

  public getKeyPair(index?: number) {
    if (!this.#keypairs) {
      throw new Error('Account mnemonic is not set')
    }

    if (index === undefined) {
      index = this.#activeIndex
    } else {
      this.#activeIndex = index
    }

    const key = index.toString()
    let keypair = this.#keypairs[key]
    if (!keypair) {
      keypair = this.addKeyPair(index)
    }
    return keypair
  }
}
