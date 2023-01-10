// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isBasePayload } from '_payloads'

import type { BasePayload, Payload } from '_payloads'
import type { Account } from '_redux/slices/account'

type MethodToPayloads = {
  create: {
    args: { password: string; importedEntropy?: string }
    return: Account
  }
  add: {
    args: { importedPrivateKey?: string }
    return: Account
  }
  checkPassword: {
    args: string
    return: never
  }
  changePassword: {
    args: { oldPassword: string; newPassword: string }
    return: never
  }
  unlock: {
    args: { password: string }
    return: never
  }
  walletStatusUpdate: {
    args: never
    return: Partial<{
      isLocked: boolean
      isInitialized: boolean
      activeAccount: Account
    }>
  }
  allAccounts: {
    args: never
    return: Account[]
  }
  lock: {
    args: never
    return: never
  }
  clear: {
    args: never
    return: never
  }
  appStatusUpdate: {
    args: { active: boolean }
    return: never
  }
  setLockTimeout: {
    args: { timeout: number }
    return: never
  }
  setActiveAccount: {
    args: { address: string }
    return: never
  }
  setAccountMeta: {
    args: { address: string; alias?: string; avatar?: string }
    return: never
  }
}

export interface KeyringPayload<Method extends keyof MethodToPayloads>
  extends BasePayload {
  type: 'keyring'
  method: Method
  args?: MethodToPayloads[Method]['args']
  return?: MethodToPayloads[Method]['return']
}

export function isKeyringPayload<Method extends keyof MethodToPayloads>(
  payload: Payload,
  method: Method
): payload is KeyringPayload<Method> {
  return (
    isBasePayload(payload) &&
    payload.type === 'keyring' &&
    'method' in payload &&
    payload['method'] === method
  )
}
