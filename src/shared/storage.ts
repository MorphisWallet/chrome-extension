import Browser from 'webextension-polyfill'

import { encrypt, decrypt } from './cryptography/keystore'

const PASSWORD = process.env.MAIN_PASSWORD
const SALT = process.env.MAIN_SALT

if (!PASSWORD) {
  throw new Error('No password is from process.env')
}

/**
 * directly get value by key from localstorage
 * @param key
 * @returns promise value by key
 */
export const get = async <T = string | number>(
  key: string
): Promise<T | undefined> => {
  const response = await Browser.storage.local.get(key)
  return response[key]
}

/**
 * directly store key and value in localstorage
 * @param keyValue
 */
export const set = async (keyValue: Record<string, unknown>): Promise<void> => {
  await Browser.storage.local.set(keyValue)
}

/**
 * store encrypted key and encrypted value in localstorage
 * @param password
 * @param key
 * @param value
 * @returns
 */
export const setEncrypted = async <T>(
  password: string = PASSWORD as string,
  key: string,
  value: T
) => {
  if (!key) return
  if (!value) return

  const encryptedKey = await encrypt(password, key, undefined, SALT)
  const encryptedValue = await encrypt(password, value, undefined, SALT)

  await set({ [encryptedKey]: encryptedValue })
}

/**
 * get and decrypt encrypted value by encrypted key
 * @param password
 * @param key
 * @returns
 */
export const getEncrypted = async <T>(
  password: string = PASSWORD as string,
  key: string
): Promise<T | null> => {
  const encryptedKey = await encrypt(password, key, undefined, SALT)
  const encryptedValue = await get(encryptedKey)

  if (!encryptedValue) return null

  return (await decrypt(encryptedValue as string, password)) as T
}

/**
 * set the value null by encrypted key
 * @param password
 * @param key
 */
export const deleteEncrypted = async (
  password: string = PASSWORD as string,
  key: string
) => {
  const encryptedKey = await encrypt(password, key, undefined, PASSWORD)
  await set({ [encryptedKey]: null })
}

/**
 * clear all storage
 */
export const clearStorage = async () => await Browser.storage.local.clear()
