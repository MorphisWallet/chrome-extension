// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import Browser from 'webextension-polyfill'
import { getObjectId } from '@mysten/sui.js'
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

import { suiObjectsAdapterSelectors } from '_redux/slices/sui-objects'
import { Coin } from '_redux/slices/sui-objects/Coin'
import { thunkExtras } from '_store/thunk-extras'

import type { ObjectId, SuiMoveObject } from '@mysten/sui.js'
import type { PayloadAction, Reducer } from '@reduxjs/toolkit'
import type { KeyringPayload } from '_payloads/keyring'
import type { RootState } from '_redux/RootReducer'
import type { AppThunkConfig } from '_store/thunk-extras'

export type Account = {
  address: string // account address as id
  index: number // for private-key-imported account, set index -1
  createdTime: number // created timestamp, for sorting
  privateKey?: string
  alias?: string
  avatar?: string
}

export const createVault = createAsyncThunk<
  void,
  {
    importedEntropy?: string
    password: string
  },
  AppThunkConfig
>(
  'account/createVault',
  async (
    { importedEntropy, password },
    { extra: { background }, dispatch }
  ) => {
    const { account, mnemonics } = await background.createAccount(
      password,
      importedEntropy
    )
    await background.unlockWallet(password)

    dispatch(setActiveAddress(account.address))
    await dispatch(getAllAccounts()).unwrap()

    thunkExtras.keypairVault.mnemonic = mnemonics
    thunkExtras.keypairVault.activeIndex = account.index
  }
)

export const addVault = createAsyncThunk<
  void,
  {
    importedEntropy?: string
  },
  AppThunkConfig
>(
  'account/addVault',
  async ({ importedEntropy }, { extra: { background }, dispatch }) => {
    const account = await background.addAccount(importedEntropy)

    dispatch(setActiveAddress(account.address))
    await dispatch(getAllAccounts()).unwrap()

    thunkExtras.keypairVault.activeIndex = account.index
  }
)

// export const loadEntropyFromKeyring = createAsyncThunk<
//   string,
//   { password?: string }, // can be undefined when we know Keyring is unlocked
//   AppThunkConfig
// >(
//   'account/loadEntropyFromKeyring',
//   async ({ password }, { extra: { background } }) =>
//     await background.getEntropy(password)
// )

export const checkPassword = createAsyncThunk<void, string, AppThunkConfig>(
  'account/checkPassword',
  async (password, { extra: { background } }) => {
    await background.checkPassword(password)
  }
)

export const changePassword = createAsyncThunk<
  void,
  { oldPassword: string; newPassword: string },
  AppThunkConfig
>(
  'account/changePassword',
  async ({ oldPassword, newPassword }, { extra: { background } }) => {
    await background.changePassword(oldPassword, newPassword)
  }
)

export const setActiveAccount = createAsyncThunk<
  Account,
  string,
  AppThunkConfig
>(
  'account/setActiveAccount',
  async (address, { extra: { background }, dispatch }) => {
    const activeAccount = await background.setActiveAccount(address)

    dispatch(setActiveAddress(activeAccount.address))
    thunkExtras.keypairVault.activeIndex = activeAccount.index

    return activeAccount
  }
)

export const getAllAccounts = createAsyncThunk<Account[], void, AppThunkConfig>(
  'account/getAllAccounts',
  async (_, { extra: { background }, dispatch }) => {
    const accounts = await background.getAllAccounts()
    dispatch(setAllAccounts(accounts))

    return accounts
  }
)

export const logout = createAsyncThunk<void, void, AppThunkConfig>(
  'account/logout',
  async (_, { extra: { background } }): Promise<void> => {
    await Browser.storage.local.clear()
    await background.clearWallet()
  }
)

export const setMeta = createAsyncThunk<
  void,
  { address: string; alias?: string; avatar?: string },
  AppThunkConfig
>(
  'account/setAccountMeta',
  async ({ address, alias, avatar }, { extra: { background }, dispatch }) => {
    await background.setAccountMeta({
      address,
      alias,
      avatar,
    })
    await dispatch(getAllAccounts()).unwrap()
  }
)

type AccountState = {
  creating: boolean
  isLocked: boolean | null
  isInitialized: boolean | null
  activeAccountAddress: string | null
  allAccounts: Account[]
}

const initialState: AccountState = {
  creating: false,
  isLocked: null,
  isInitialized: null,
  activeAccountAddress: null,
  allAccounts: [],
}

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setActiveAddress: (state, { payload }: PayloadAction<string>) => {
      state.activeAccountAddress = payload
    },
    setKeyringStatus: (
      state,
      { payload }: PayloadAction<KeyringPayload<'walletStatusUpdate'>['return']>
    ) => {
      if (typeof payload?.isLocked !== 'undefined') {
        state.isLocked = payload.isLocked
      }
      if (typeof payload?.isInitialized !== 'undefined') {
        state.isInitialized = payload.isInitialized
      }
      if (payload?.mnemonics) {
        thunkExtras.keypairVault.mnemonic = payload.mnemonics
      }
      if (payload?.activeAccount) {
        state.activeAccountAddress = payload.activeAccount.address
        thunkExtras.keypairVault.activeIndex = payload.activeAccount.index
      }
    },
    setAllAccounts: (state, action: PayloadAction<Account[]>) => {
      state.allAccounts = action.payload
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(createVault.pending, (state) => {
        state.creating = true
      })
      .addCase(createVault.fulfilled, (state) => {
        state.creating = false
        state.isInitialized = true
      })
      .addCase(createVault.rejected, (state) => {
        state.creating = false
      }),
})

export const { setActiveAddress, setKeyringStatus, setAllAccounts } =
  accountSlice.actions

const reducer: Reducer<typeof initialState> = accountSlice.reducer
export default reducer

export const activeAccountAddressSelector = ({ account }: RootState) =>
  account.activeAccountAddress

export const activeAccountSelector = ({ account }: RootState) =>
  account.allAccounts.find(
    (_account) => _account.address === account.activeAccountAddress
  )

export const allAccountsSelector = ({ account }: RootState) =>
  account.allAccounts

export const ownedObjects = createSelector(
  suiObjectsAdapterSelectors.selectAll,
  activeAccountAddressSelector,
  (objects, address) => {
    if (address) {
      return objects.filter(
        ({ owner }) =>
          typeof owner === 'object' &&
          'AddressOwner' in owner &&
          owner.AddressOwner === address
      )
    }
    return []
  }
)

export const accountCoinsSelector = createSelector(
  ownedObjects,
  (allSuiObjects) => {
    return allSuiObjects
      .filter(Coin.isCoin)
      .map((aCoin) => aCoin.data as SuiMoveObject)
  }
)

// return an aggregate balance for each coin type
export const accountAggregateBalancesSelector = createSelector(
  accountCoinsSelector,
  (coins) => {
    return coins.reduce((acc, aCoin) => {
      const coinType = Coin.getCoinTypeArg(aCoin)
      if (coinType) {
        if (typeof acc[coinType] === 'undefined') {
          acc[coinType] = BigInt(0)
        }
        acc[coinType] += Coin.getBalance(aCoin)
      }
      return acc
    }, {} as Record<string, bigint>)
  }
)

// return a list of balances for each coin object for each coin type
export const accountItemizedBalancesSelector = createSelector(
  accountCoinsSelector,
  (coins) => {
    return coins.reduce((acc, aCoin) => {
      const coinType = Coin.getCoinTypeArg(aCoin)
      if (coinType) {
        if (typeof acc[coinType] === 'undefined') {
          acc[coinType] = []
        }
        acc[coinType].push(Coin.getBalance(aCoin))
      }
      return acc
    }, {} as Record<string, bigint[]>)
  }
)

export const accountNftsSelector = createSelector(
  ownedObjects,
  (allSuiObjects) => {
    return allSuiObjects.filter((anObj) => !Coin.isCoin(anObj))
  }
)

export const createAccountNftByIdSelector = (nftId: ObjectId) =>
  createSelector(
    accountNftsSelector,
    (allNfts) =>
      allNfts.find((nft) => getObjectId(nft.reference) === nftId) || null
  )

export const createAccountSelector = (address: string) =>
  createSelector(allAccountsSelector, (allAccounts) =>
    allAccounts.find((_account) => _account.address === address)
  )
