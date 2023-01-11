// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// import { isAnyOf } from '@reduxjs/toolkit'

// import {
//   createVault,
//   setActiveAccount,
//   addVault,
//   setActiveAddress,
//   setKeyringStatus,
// } from '_redux/slices/account'
// import { thunkExtras } from '_store/thunk-extras'

import type { Middleware } from '@reduxjs/toolkit'

// const keypairVault = thunkExtras.keypairVault

// actions that should update active account address and accounts
// const matchUpdateKeypairVault = isAnyOf(
//   createVault.fulfilled,
//   addVault.fulfilled,
//   setActiveAccount.fulfilled,
//   setKeyringStatus
// )

/**
 * for create account, add account and set active account thunk,
 * additionally set active address of the newly created or added account address, or the newly-set-active account address
 */
export const KeypairVaultMiddleware: Middleware = () => (next) => (action) =>
  next(action)
