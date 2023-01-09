import {
  encrypt as browserPassworderEncrypt,
  decrypt as browserPassworderDecrypt,
} from '@metamask/browser-passworder'
import Browser from 'webextension-polyfill'

const PASSWORD = process.env.MAIN_PASSWORD
const SALT = process.env.MAIN_SALT

// get value by key from browser storage
export const get = async <T = string | number>(key: string): Promise<T> => {
  const response = await Browser.storage.local.get(key)
  return response[key]
}

// store value and value into browser storage
export const set = async (
  keyValue: Record<string, string | null>
): Promise<void> => {
  await Browser.storage.local.set(keyValue)
}

// store encrypted key and value into browser storage
export const setEncrypted = async (
  password: string = PASSWORD as string,
  key: string,
  value: string
) => {
  if (!key) return
  if (!value) return

  const encryptedKey = await browserPassworderEncrypt(
    password,
    key,
    undefined,
    SALT
  )
  const encryptedValue = await browserPassworderEncrypt(password, value)

  await set({ [encryptedKey]: encryptedValue })
}

// get and decrypt encrypted value by encrypted key
export const getEncrypted = async <T>(
  password: string = PASSWORD as string,
  key: string
): Promise<T | null> => {
  const encryptedKey = await browserPassworderEncrypt(
    password,
    key,
    undefined,
    SALT
  )
  const encryptedValue = await get(encryptedKey)

  if (!encryptedValue) return null

  return (await browserPassworderDecrypt(
    encryptedValue as string,
    password
  )) as T
}

// set the value null by encrypted key
export const deleteEncrypted = async (
  password: string = PASSWORD as string,
  key: string
) => {
  const encryptedKey = await browserPassworderEncrypt(
    password,
    key,
    undefined,
    PASSWORD
  )
  await set({ [encryptedKey]: null })
}
