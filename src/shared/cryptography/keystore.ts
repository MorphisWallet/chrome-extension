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
  secrets: Serializable
): Promise<string> {
  return browserPassworderEncrypt(password, secrets)
}

export async function decrypt<T extends Serializable>(
  password: string,
  ciphertext: string
): Promise<T> {
  return (await browserPassworderDecrypt(password, ciphertext)) as T
}
