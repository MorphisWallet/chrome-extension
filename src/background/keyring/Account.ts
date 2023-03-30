// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type SuiAddress } from '@mysten/sui.js'

import {
  type DerivedAccount,
  type SerializedDerivedAccount,
} from './DerivedAccount'
import {
  type ImportedAccount,
  type SerializedImportedAccount,
} from './ImportedAccount'

export enum AccountType {
  IMPORTED = 'IMPORTED',
  DERIVED = 'DERIVED',
}

export type SerializedAccount =
  | SerializedImportedAccount
  | SerializedDerivedAccount

export interface Account {
  readonly type: AccountType
  readonly address: SuiAddress
  toJSON(): SerializedAccount
}

export function isImportedOrDerivedAccount(
  account: Account
): account is ImportedAccount | DerivedAccount {
  return isImportedAccount(account) || isDerivedAccount(account)
}

export function isImportedAccount(
  account: Account
): account is ImportedAccount {
  return account.type === AccountType.IMPORTED
}

export function isDerivedAccount(account: Account): account is DerivedAccount {
  return account.type === AccountType.DERIVED
}
