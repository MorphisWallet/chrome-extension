// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import {
  encrypt as browserPassworderEncrypt,
  decrypt as browserPassworderDecrypt,
} from '@metamask/browser-passworder'

type Serializable =
  | string
  | number
  | boolean
  | { [index: string]: Serializable }

export async function encrypt(
  password: string,
  plainData: Serializable,
  key?: CryptoKey,
  salt?: string
): Promise<string> {
  return browserPassworderEncrypt(password, plainData, key, salt)
}

export async function decrypt<T extends Serializable>(
  password: string,
  cipherData: string,
  key?: CryptoKey
): Promise<T> {
  return (await browserPassworderDecrypt(password, cipherData, key)) as T
}
