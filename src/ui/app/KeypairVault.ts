// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Ed25519Keypair } from '@mysten/sui.js'

import { getKeypairFromMnemonics } from '_src/shared/cryptography/bip39'

export default class KeypairVault {
  #mnemonic = ''
  #activeIndex = 0

  get mnemonic() {
    return this.#mnemonic
  }

  set mnemonic(mnemonic: string) {
    this.#mnemonic = mnemonic
  }

  get activeIndex() {
    return this.#activeIndex
  }

  set activeIndex(index: number) {
    this.#activeIndex = index
  }

  public getKeyPair(index?: number): Ed25519Keypair {
    const _index = index ?? this.activeIndex
    if (typeof _index !== 'number') {
      throw new Error('Active account index is not set')
    }

    if (!this.#mnemonic) {
      throw new Error('Mnemonic is not set')
    }

    return getKeypairFromMnemonics(this.#mnemonic)
  }
}
