// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isBasePayload } from '_payloads'

import type { ExportedKeypair } from '@mysten/sui.js'
import type { BasePayload, Payload } from '_payloads'

type MethodToPayloads = {
  create: {
    args: { password: string; importedEntropy?: string }
    return: { keypair: ExportedKeypair; alias: string }
  }
  getEntropy: {
    args: string | undefined
    return: string
  }
  checkPassword: {
    args: string
    return: boolean
  }
  changePassword: {
    args: { oldPassword: string; newPassword: string }
    return: boolean
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
      // we can replace keypair (once we stop signing from the UI) with the account address
      activeAccount: ExportedKeypair
      alias?: string
    }>
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
