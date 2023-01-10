import throttle from 'lodash/throttle'

import {
  set,
  setEncrypted,
  getEncrypted,
  deleteEncrypted,
  clearStorage,
} from '_src/shared/storage'
import {
  generateMnemonic,
  normalizeMnemonics,
  validateMnemonics,
  getKeypairFromMnemonics,
} from '_shared/cryptography/bip39'
import {
  AUTO_LOCK_TIMER_MAX_MINUTES,
  AUTO_LOCK_TIMER_MIN_MINUTES,
  AUTO_LOCK_TIMER_STORAGE_KEY,
} from '_src/shared/constants'
import { setLockAlarm, clearLockAlarm } from './Alarms'
import { createMessage } from '_messages'
import { isKeyringPayload } from '_payloads/keyring'

import type { Account } from '_src/ui/app/redux/slices/account'
import type { Message } from '_messages'
import type { ErrorPayload } from '_payloads'
import type { KeyringPayload } from '_payloads/keyring'
import type { Connection } from '_src/background/connections/Connection'

// storage key for all accounts, encrypted by user password
const ACCOUNTS_KEY = 'morphis_accounts'
// storage key for active account address, encrypted by app password
const ACTIVE_ACCOUNT_ADDRESS_KEY = 'morphis_active_account'
// storage key for default mnemonics, encrypted by user password
const MNEMONICS_KEY = 'morphis_mnemonics'
// storage key for wallet lock status; false = locked, true = unlocked, encrypted by app password
const WALLET_UNLOCK_FLAG_KEY = 'morphis_wallets_lock_flag'
// storage key for cached pwd, encrypted by app password
const CACHED_PWD_KEY = 'morphis_cached_pwd'

const DEFAULT_AVATAR_COLOR_POOL = [
  '#BEF9FF',
  '#FFF3EC',
  '#82FFAC',
  '#E3C8F3',
  '#FEBBA8',
  '#000000',
  '#FFFFFF',
  '#FFFFC7',
  '#3FFFE4',
  '#9B72F3',
]

const genRandomAvatarColor = () =>
  DEFAULT_AVATAR_COLOR_POOL[
    Math.floor(Math.random() * DEFAULT_AVATAR_COLOR_POOL.length)
  ]

/**
 * check if the wallet is initialized by stored accounts
 * if there exists one or more accounts, the wallet must be initialized
 * @returns boolean
 */
export const isWalletInitialized = async () =>
  !!(await getEncrypted(undefined, ACCOUNTS_KEY))

/**
 * initialize and create a new wallet account
 * 1. generate or import the mnemonics
 * 2. unlock wallet
 * 3. store account
 * 4. cache pwd
 * @param password
 * @param importedMnemonics
 */
export const createAccount = async (
  password: string,
  importedMnemonics?: string
) => {
  const walletInitializedFlag = await isWalletInitialized()
  if (walletInitializedFlag) {
    throw new Error('Wallet is already initialized')
  }

  const _mnemonics = importedMnemonics || generateMnemonic()
  const validMnemonicsFlag = validateMnemonics(normalizeMnemonics(_mnemonics))
  if (!validMnemonicsFlag) {
    throw new Error('Invalid mnemonics')
  }

  await setEncrypted(password, MNEMONICS_KEY, _mnemonics)

  const account: Account = {
    address: getKeypairFromMnemonics(_mnemonics).getPublicKey().toSuiAddress(),
    index: 0,
    alias: 'Account1',
    avatar: genRandomAvatarColor(),
  }
  await setEncrypted(undefined, ACTIVE_ACCOUNT_ADDRESS_KEY, account.address)
  await setEncrypted(password, ACCOUNTS_KEY, [account])

  await setEncrypted(undefined, WALLET_UNLOCK_FLAG_KEY, true)
  await setEncrypted(undefined, CACHED_PWD_KEY, password)
}

/**
 * add an account depending on the sole mnemonics or imported private key
 * if private key is provided, the account will have default index of -1
 * 1. check wallet status and if there exists cache
 * 2. generate new account by derivation index
 * 3. store new account
 * @param importedPrivateKey
 */
export const addAccount = async (importedPrivateKey?: string) => {
  const walletInitializedFlag = await isWalletInitialized()
  if (!walletInitializedFlag) {
    throw new Error('Wallet is not initialized')
  }

  const cachedPwd = await getEncrypted<string>(undefined, CACHED_PWD_KEY)
  if (!cachedPwd) {
    throw new Error('Cached pwd is not found')
  }

  const accounts = await getEncrypted<Account[]>(cachedPwd, ACCOUNTS_KEY)
  if (!accounts) {
    throw new Error('Cannot add account because no account is created ever')
  }

  if (!importedPrivateKey) {
    const _mnemonics = await getEncrypted<string>(undefined, MNEMONICS_KEY)
    if (!_mnemonics) {
      throw new Error('Cannot add account because mnemonics are not found')
    }

    // calculate the next derived account index
    const derivationIndex = accounts.filter(
      (_account) => _account.index > -1
    ).length
    const newAccount: Account = {
      address: getKeypairFromMnemonics(_mnemonics, derivationIndex)
        .getPublicKey()
        .toSuiAddress(),
      index: derivationIndex,
      alias: `Account${accounts.length + 1}`,
      avatar: genRandomAvatarColor(),
    }

    await setEncrypted(
      undefined,
      ACTIVE_ACCOUNT_ADDRESS_KEY,
      newAccount.address
    )
    await setEncrypted(cachedPwd, ACCOUNTS_KEY, [...accounts, newAccount])
  }
}

/**
 * clear some of the data from storage to lock the wallet
 */
export const lock = async () => {
  await deleteEncrypted(undefined, CACHED_PWD_KEY)
  await setEncrypted(undefined, WALLET_UNLOCK_FLAG_KEY, false)
  await clearLockAlarm()
}

/**
 * check password and unlock wallet
 * @param password
 */
export const unlock = async (password: string) => {
  await checkPassword(password)
  await setEncrypted(undefined, CACHED_PWD_KEY, password)
  await setEncrypted(undefined, WALLET_UNLOCK_FLAG_KEY, true)
}

/**
 * decrypt cached pwd and compare
 * @param password
 */
export const checkPassword = async (password: string) => {
  const cachedPwd = await getEncrypted<string>(undefined, CACHED_PWD_KEY)
  if (!cachedPwd) {
    throw new Error('Cached pwd is not found')
  }

  if (cachedPwd !== password) {
    throw new Error('Wrong password')
  }
}

/**
 * get encrypted info by old password and decrypt them by new password
 * @param oldPassword
 * @param newPassword
 */
export const changePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  const accounts = await getEncrypted<Account[]>(oldPassword, ACCOUNTS_KEY)
  const mnemonics = await getEncrypted<string>(oldPassword, MNEMONICS_KEY)
  if (!accounts || !mnemonics) {
    throw new Error('Cannot add account because no account is created ever')
  }

  await setEncrypted(newPassword, MNEMONICS_KEY, mnemonics)
  await setEncrypted(newPassword, ACCOUNTS_KEY, accounts)
  await setEncrypted(undefined, CACHED_PWD_KEY, newPassword)

  // due to hash key, delete old data to save storage
  await deleteEncrypted(oldPassword, MNEMONICS_KEY)
  await deleteEncrypted(oldPassword, ACCOUNTS_KEY)
}

/**
 * set active account address, usually for switching accounts
 * @param address
 */
export const setActiveAddress = async (address: string) =>
  await setEncrypted(undefined, ACTIVE_ACCOUNT_ADDRESS_KEY, address)

/**
 * set account meta by address
 * @param meta
 */
export const setAccountMeta = async ({
  address,
  alias,
  avatar,
}: Omit<Account, 'index' | 'privateKey'>) => {
  const cachedPwd = await getEncrypted<string>(undefined, CACHED_PWD_KEY)
  if (!cachedPwd) {
    throw new Error('Cached pwd is not found')
  }

  const accounts = await getEncrypted<Account[]>(cachedPwd, ACCOUNTS_KEY)
  if (!accounts) {
    throw new Error('Cannot add account because no account is created ever')
  }

  const targetAccount = accounts.find(
    (_account) => _account.address === address
  )
  if (!targetAccount) {
    throw new Error(`Account with address ${address} is not found`)
  }
  const updatedAccounts = [
    ...accounts.filter((_account) => _account.address !== address),
    {
      ...targetAccount,
      alias: alias || targetAccount.alias,
      avatar: avatar || targetAccount.avatar,
    },
  ]

  await setEncrypted(cachedPwd, ACCOUNTS_KEY, updatedAccounts)
}

/**
 * set wallet lock timeout. lock the wallet when time is up
 * @param timeout
 */
export const setLockTimeout = async (timeout: number) => {
  if (
    timeout > AUTO_LOCK_TIMER_MAX_MINUTES ||
    timeout < AUTO_LOCK_TIMER_MIN_MINUTES
  ) {
    throw new Error(
      `Timeout should be between ${AUTO_LOCK_TIMER_MIN_MINUTES} and ${AUTO_LOCK_TIMER_MAX_MINUTES}`
    )
  }

  await set({ [AUTO_LOCK_TIMER_STORAGE_KEY]: timeout })

  setLockAlarm()
}

/**
 * get all stored accounts
 */
export const getAllAccounts = async () => {
  const cachedPwd = await getEncrypted<string>(undefined, CACHED_PWD_KEY)
  if (!cachedPwd) {
    throw new Error('Cached pwd is not found')
  }

  const accounts = await getEncrypted<Account[]>(cachedPwd, ACCOUNTS_KEY)
  if (!accounts) {
    throw new Error('Cannot add account because no account is created ever')
  }

  return accounts
}

/**
 * clear all cached storage and lock the wallet
 */
export const clear = async () => await clearStorage()

/**
 * handle message from UI
 */
export const handleUiMessage = async (
  { id, payload }: Message,
  uiConnection: Connection
) => {
  try {
    if (isKeyringPayload(payload, 'create') && payload.args) {
      const { password, importedEntropy } = payload.args
      await createAccount(password, importedEntropy)
      await unlock(password)
    } else if (isKeyringPayload(payload, 'add') && payload.args) {
      const { importedPrivateKey } = payload.args
      await addAccount(importedPrivateKey)
    } else if (isKeyringPayload(payload, 'unlock') && payload.args) {
      await unlock(payload.args.password)
      uiConnection.send(createMessage({ type: 'done' }, id))
    } else if (isKeyringPayload(payload, 'checkPassword') && payload.args) {
      await checkPassword(payload.args)
    } else if (isKeyringPayload(payload, 'changePassword') && payload.args) {
      const { oldPassword, newPassword } = payload.args
      await changePassword(oldPassword, newPassword)
    } else if (isKeyringPayload(payload, 'walletStatusUpdate')) {
      const walletUnlockFlag =
        (await getEncrypted<boolean>(undefined, WALLET_UNLOCK_FLAG_KEY)) ||
        false
      const isInitialized = await isWalletInitialized()
      uiConnection.send(
        createMessage<KeyringPayload<'walletStatusUpdate'>>(
          {
            type: 'keyring',
            method: 'walletStatusUpdate',
            return: {
              isLocked: !walletUnlockFlag,
              isInitialized: isInitialized,
            },
          },
          id
        )
      )
    } else if (isKeyringPayload(payload, 'setActiveAccount') && payload.args) {
      await setActiveAddress(payload.args.address)
    } else if (isKeyringPayload(payload, 'allAccounts')) {
      const accounts = await getAllAccounts()
      uiConnection.send(
        createMessage<KeyringPayload<'allAccounts'>>(
          {
            type: 'keyring',
            method: 'allAccounts',
            return: accounts,
          },
          id
        )
      )
    } else if (isKeyringPayload(payload, 'lock')) {
      lock()
      uiConnection.send(createMessage({ type: 'done' }, id))
    } else if (isKeyringPayload(payload, 'clear')) {
      await clear()
      uiConnection.send(createMessage({ type: 'done' }, id))
    } else if (
      isKeyringPayload(payload, 'appStatusUpdate') &&
      typeof payload.args?.active === 'boolean'
    ) {
      const appActiveFlag = payload.args?.active
      if (appActiveFlag) {
        throttle(
          async () => {
            const walletUnlockFlag =
              (await getEncrypted<boolean>(
                undefined,
                WALLET_UNLOCK_FLAG_KEY
              )) || false
            if (walletUnlockFlag) {
              await setLockAlarm()
            }
          },
          1000,
          { leading: true }
        )
      }
    } else if (isKeyringPayload(payload, 'setLockTimeout') && payload.args) {
      // TODO: lock time out
      uiConnection.send(createMessage({ type: 'done' }, id))
    } else if (isKeyringPayload(payload, 'setAccountMeta') && payload.args) {
      await setAccountMeta(payload.args)
    }
  } catch (err) {
    uiConnection.send(
      createMessage<ErrorPayload>(
        { code: -1, error: true, message: (err as Error).message },
        id
      )
    )
  }
}
