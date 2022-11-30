// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { registerWallet } from '@mysten/wallet-standard'

import { DAppInterface } from './DAppInterface'
import { SuiWallet } from './WalletStandardInterface'

registerWallet(new SuiWallet())

try {
  Object.defineProperty(window, 'morphisWallet', {
    enumerable: false,
    configurable: false,
    value: new DAppInterface(),
  })
} catch (e) {
  console.warn(
    '[morphis-wallet] Unable to attach to window.morphisWallet. There are likely multiple copies of the Morphis Wallet installed.'
  )
}
