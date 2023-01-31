import { Base64DataBuffer } from '@mysten/sui.js'
import mitt from 'mitt'
import throttle from 'lodash/throttle'

import {
  set,
  setEncrypted,
  getEncrypted,
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
// const WALLET_UNLOCK_FLAG_KEY = 'morphis_wallets_lock_flag'
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

// listen to event to push new locked status to UI
const events = mitt<{ lockedStatusUpdate: boolean }>()

export const on = events.on
export const off = events.off

const notifyLockedStatusUpdate = (isLocked: boolean) => {
  events.emit('lockedStatusUpdate', isLocked)
}

class AccountStatus {
  #unlockFlag = false

  set unlockFlag(value: boolean) {
    this.#unlockFlag = value
  }

  get unlockFlag() {
    return this.#unlockFlag
  }
}

export const accountStatus = new AccountStatus()

/**
 * check if the wallet is initialized by stored active account address
 * if there exists active account address, the wallet must be initialized
 * @returns boolean
 */
export const isWalletInitialized = async () =>
  !!(await getEncrypted(undefined, ACTIVE_ACCOUNT_ADDRESS_KEY))

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
    address: `0x${getKeypairFromMnemonics(_mnemonics)
      .getPublicKey()
      .toSuiAddress()}`,
    index: 0,
    createdTime: +new Date(),
    alias: 'Account1',
    avatar: genRandomAvatarColor(),
  }

  await setEncrypted(undefined, ACTIVE_ACCOUNT_ADDRESS_KEY, account.address)
  await setEncrypted(password, ACCOUNTS_KEY, [account])

  await setEncrypted(undefined, CACHED_PWD_KEY, password)
  accountStatus.unlockFlag = true

  return { account, mnemonics: _mnemonics }
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
    const _mnemonics = await getEncrypted<string>(cachedPwd, MNEMONICS_KEY)
    if (!_mnemonics) {
      throw new Error('Cannot add account because mnemonics are not found')
    }

    // calculate the next derived account index
    const derivationIndex = accounts.filter(
      (_account) => _account.index > -1
    ).length
    const newAccount: Account = {
      address: `0x${getKeypairFromMnemonics(_mnemonics, derivationIndex)
        .getPublicKey()
        .toSuiAddress()}`,
      index: derivationIndex,
      createdTime: +new Date(),
      alias: `Account${accounts.length + 1}`,
      avatar: genRandomAvatarColor(),
    }

    await setEncrypted(
      undefined,
      ACTIVE_ACCOUNT_ADDRESS_KEY,
      newAccount.address
    )
    await setEncrypted(cachedPwd, ACCOUNTS_KEY, [...accounts, newAccount])

    return newAccount
  }
}

/**
 * clear some of the data from storage to lock the wallet
 */
export const lock = async () => {
  await clearLockAlarm()

  accountStatus.unlockFlag = false
  notifyLockedStatusUpdate(!accountStatus.unlockFlag)
}

/**
 * check password and unlock wallet
 * @param password
 */
export const unlock = async (password: string) => {
  await checkPassword(password)
  await setEncrypted(undefined, CACHED_PWD_KEY, password)

  accountStatus.unlockFlag = true
  notifyLockedStatusUpdate(!accountStatus.unlockFlag)
}

/**
 * try to decrypt encrypted accounts as checking password
 *there must exist accounts before checking password
 * @param password
 */
export const checkPassword = async (password: string) => {
  await getEncrypted(password, ACCOUNTS_KEY)
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
}

/**
 * set active account address, usually for switching accounts
 * @param address
 */
export const setActiveAddress = async (address: string) => {
  const cachedPwd = await getEncrypted<string>(undefined, CACHED_PWD_KEY)
  if (!cachedPwd) {
    throw new Error('Cached pwd is not found')
  }

  const accounts = await getEncrypted<Account[]>(cachedPwd, ACCOUNTS_KEY)
  if (!accounts) {
    throw new Error('Cannot add account because no account is created ever')
  }

  const activeAccount = accounts.find(
    (_account) => _account.address === address
  )
  if (!activeAccount) {
    throw new Error(`Cannot find account with address ${address}`)
  }

  await setEncrypted(undefined, ACTIVE_ACCOUNT_ADDRESS_KEY, address)

  return activeAccount
}

/**
 * set account meta by address
 * @param meta
 */
export const setAccountMeta = async ({
  address,
  alias,
  avatar,
}: Omit<Account, 'index' | 'privateKey' | 'createdTime'>) => {
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
  const isInitialized = await isWalletInitialized()
  if (!isInitialized) {
    return []
  }

  const cachedPwd = await getEncrypted<string>(undefined, CACHED_PWD_KEY)
  if (!cachedPwd) {
    throw new Error('Cached pwd is not found')
  }

  const accounts = await getEncrypted<Account[]>(cachedPwd, ACCOUNTS_KEY)
  if (!accounts) {
    throw new Error('Cannot add account because no account is created ever')
  }

  return accounts.sort((a, b) => a.createdTime - b.createdTime)
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
      const { account, mnemonics } = await createAccount(
        password,
        importedEntropy
      )

      uiConnection.send(
        createMessage<KeyringPayload<'create'>>(
          {
            type: 'keyring',
            method: 'create',
            return: { account, mnemonics },
          },
          id
        )
      )
    } else if (isKeyringPayload(payload, 'add') && payload.args) {
      const { importedPrivateKey } = payload.args
      const account = await addAccount(importedPrivateKey)

      uiConnection.send(
        createMessage<KeyringPayload<'add'>>(
          {
            type: 'keyring',
            method: 'add',
            return: account,
          },
          id
        )
      )
    } else if (isKeyringPayload(payload, 'unlock') && payload.args) {
      await unlock(payload.args.password)
      uiConnection.send(createMessage({ type: 'done' }, id))
    } else if (isKeyringPayload(payload, 'checkPassword') && payload.args) {
      await checkPassword(payload.args)
      uiConnection.send(createMessage({ type: 'done' }, id))
    } else if (isKeyringPayload(payload, 'changePassword') && payload.args) {
      const { oldPassword, newPassword } = payload.args
      await changePassword(oldPassword, newPassword)
      uiConnection.send(createMessage({ type: 'done' }, id))
    } else if (isKeyringPayload(payload, 'walletStatusUpdate')) {
      const isInitialized = await isWalletInitialized()
      if (!isInitialized) {
        uiConnection.send(
          createMessage<KeyringPayload<'walletStatusUpdate'>>(
            {
              type: 'keyring',
              method: 'walletStatusUpdate',
              return: {
                isLocked: !accountStatus.unlockFlag,
                isInitialized: isInitialized,
              },
            },
            id
          )
        )
        return
      }

      const activeAccount = await getActiveAccount()
      const mnemonics = await getMnemonics()

      uiConnection.send(
        createMessage<KeyringPayload<'walletStatusUpdate'>>(
          {
            type: 'keyring',
            method: 'walletStatusUpdate',
            return: {
              isLocked: !accountStatus.unlockFlag,
              isInitialized: isInitialized,
              activeAccount,
              mnemonics,
            },
          },
          id
        )
      )
    } else if (isKeyringPayload(payload, 'setActiveAccount') && payload.args) {
      const activeAccount = await setActiveAddress(payload.args.address)

      uiConnection.send(
        createMessage<KeyringPayload<'setActiveAccount'>>(
          {
            type: 'keyring',
            method: 'setActiveAccount',
            return: activeAccount,
          },
          id
        )
      )
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
    } else if (isKeyringPayload(payload, 'signData')) {
      if (!accountStatus.unlockFlag) {
        throw new Error('Keyring is locked. Unlock it first.')
      }
      if (!payload.args) {
        throw new Error('Missing parameters.')
      }
      const { data, address } = payload.args
      const activeAccount = await getActiveAccount()
      if (!activeAccount) {
        throw new Error(`Account for address ${address} not found in keyring`)
      }
      const mnemonics = await getMnemonics()
      const keypair = getKeypairFromMnemonics(
        mnemonics,
        activeAccount.index > 0 ? activeAccount.index : 0
      )
      uiConnection.send(
        createMessage<KeyringPayload<'signData'>>(
          {
            type: 'keyring',
            method: 'signData',
            return: {
              signatureScheme: keypair.getKeyScheme(),
              signature: keypair
                .signData(new Base64DataBuffer(data))
                .toString(),
              pubKey: keypair.getPublicKey().toBase64(),
            },
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
            if (accountStatus.unlockFlag) {
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
      uiConnection.send(createMessage({ type: 'done' }, id))
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

/**
 * get active account by active account address
 */
const getActiveAccount = async () => {
  const cachedPwd = await getEncrypted<string>(undefined, CACHED_PWD_KEY)
  if (!cachedPwd) {
    throw new Error('Cached pwd is not found')
  }

  const accounts = await getEncrypted<Account[]>(cachedPwd, ACCOUNTS_KEY)
  if (!accounts) {
    throw new Error('No account is created ever')
  }

  const activeAccountAddress = await getEncrypted(
    undefined,
    ACTIVE_ACCOUNT_ADDRESS_KEY
  )
  if (!activeAccountAddress) {
    throw new Error('No active account address is found')
  }

  const activeAccount = accounts.find(
    (_account) => _account.address === activeAccountAddress
  )
  if (!activeAccountAddress) {
    throw new Error(`No account with address ${activeAccountAddress} is found`)
  }

  return activeAccount as Account
}

const getMnemonics = async () => {
  const cachedPwd = await getEncrypted<string>(undefined, CACHED_PWD_KEY)
  if (!cachedPwd) {
    throw new Error('Cached pwd is not found')
  }

  const _mnemonics = await getEncrypted<string>(cachedPwd, MNEMONICS_KEY)
  if (!_mnemonics) {
    throw new Error('Cannot add account because mnemonics are not found')
  }

  return _mnemonics
}
