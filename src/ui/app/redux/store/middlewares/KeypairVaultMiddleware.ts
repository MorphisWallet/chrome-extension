// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isAnyOf } from '@reduxjs/toolkit'

import {
  setAddress,
  createVault,
  setKeyringStatus,
  setActiveAccount,
  addVault,
} from '_redux/slices/account'
import { thunkExtras } from '_store/thunk-extras'

import type { Middleware } from '@reduxjs/toolkit'

const keypairVault = thunkExtras.keypairVault
const matchUpdateKeypairVault = isAnyOf(
  createVault.fulfilled,
  addVault.fulfilled,
  setKeyringStatus,
  setActiveAccount.fulfilled
)

export const KeypairVaultMiddleware: Middleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (matchUpdateKeypairVault(action)) {
      let exportedKeypair
      if (action.payload) {
        if ('activeAccount' in action.payload) {
          exportedKeypair = action.payload.activeAccount
        } else if ('schema' in action.payload) {
          exportedKeypair = action.payload
        }
      }
      if (exportedKeypair) {
        keypairVault.keypair = exportedKeypair
        dispatch(setAddress(keypairVault.getAccount()))
      } else {
        keypairVault.clear()
        dispatch(setAddress(null))
      }
      exportedKeypair = null
    }
    return next(action)
  }
