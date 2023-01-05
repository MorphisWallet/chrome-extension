// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import Browser from 'webextension-polyfill'
import { getObjectId } from '@mysten/sui.js'
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

import { isKeyringPayload } from '_payloads/keyring'
import { suiObjectsAdapterSelectors } from '_redux/slices/sui-objects'
import { Coin } from '_redux/slices/sui-objects/Coin'

import type {
  ObjectId,
  SuiAddress,
  SuiMoveObject,
  ExportedKeypair,
} from '@mysten/sui.js'
import type { PayloadAction, Reducer } from '@reduxjs/toolkit'
import type { KeyringPayload } from '_payloads/keyring'
import type { RootState } from '_redux/RootReducer'
import type { AppThunkConfig } from '_store/thunk-extras'

export type Account = {
  id: string
  alias?: string
  avatar?: string
}

export const createVault = createAsyncThunk<
  ExportedKeypair,
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
    const { payload } = await background.createVault(password, importedEntropy)
    await background.unlockWallet(password)
    if (!isKeyringPayload(payload, 'create')) {
      throw new Error('Unknown payload')
    }
    if (!payload.return?.keypair) {
      throw new Error('Empty keypair in payload')
    }
    dispatch(setAlias(payload.return.alias || null))
    dispatch(setAvatar(payload.return.avatar || null))
    return payload.return.keypair
  }
)

// To add multiple wallet vaults
export const addVault = createAsyncThunk<
  ExportedKeypair,
  {
    importedEntropy?: string
  },
  AppThunkConfig
>(
  'account/addVault',
  async ({ importedEntropy }, { extra: { background }, dispatch }) => {
    const { payload } = await background.addVault(importedEntropy)
    await background.unlockWallet()
    if (!isKeyringPayload(payload, 'add')) {
      throw new Error('Unknown payload')
    }
    if (!payload.return?.keypair) {
      throw new Error('Empty keypair in payload')
    }
    dispatch(setAlias(payload.return.alias || null))
    dispatch(setAvatar(payload.return.avatar || null))
    return payload.return.keypair
  }
)

export const loadEntropyFromKeyring = createAsyncThunk<
  string,
  { password?: string }, // can be undefined when we know Keyring is unlocked
  AppThunkConfig
>(
  'account/loadEntropyFromKeyring',
  async ({ password }, { extra: { background } }) =>
    await background.getEntropy(password)
)

export const checkPassword = createAsyncThunk<boolean, string, AppThunkConfig>(
  'account/checkPassword',
  async (password, { extra: { background } }) =>
    await background.checkPassword(password)
)

export const changePassword = createAsyncThunk<
  boolean,
  { oldPassword: string; newPassword: string },
  AppThunkConfig
>(
  'account/changePassword',
  async ({ oldPassword, newPassword }, { extra: { background } }) =>
    await background.changePassword(oldPassword, newPassword)
)

export const setActiveAccount = createAsyncThunk<
  ExportedKeypair,
  string,
  AppThunkConfig
>(
  'account/setActiveAccount',
  async (id, { extra: { background }, dispatch }) => {
    const { payload } = await background.setActiveAccount(id)
    if (!isKeyringPayload(payload, 'setActiveAccount')) {
      throw new Error('Unknown payload')
    }

    if (!payload.return) {
      throw new Error('No response from service worker')
    }

    const { keypair, alias, avatar } = payload.return
    dispatch(setAlias(alias || null))
    dispatch(setAvatar(avatar || null))

    return keypair
  }
)

export const getAllAccounts = createAsyncThunk<Account[], void, AppThunkConfig>(
  'account/getAllAccounts',
  async (_, { extra: { background } }) => {
    const { payload } = await background.getAllAccounts()
    if (!isKeyringPayload(payload, 'allAccounts')) {
      throw new Error('Unknown payload')
    }
    return payload.return || []
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
  { alias?: string; avatar?: string },
  AppThunkConfig
>(
  'account/setMeta',
  async ({ alias, avatar }, { extra: { background }, dispatch }) => {
    const { alias: _alias, avatar: _avatar } = await background.setMeta({
      alias,
      avatar,
    })
    if (_alias) {
      dispatch(setAlias(_alias))
    }
    if (_avatar) {
      dispatch(setAvatar(_avatar))
    }
  }
)

type AccountState = {
  creating: boolean
  address: SuiAddress | null
  alias: string | null
  avatar: string | null
  isLocked: boolean | null
  isInitialized: boolean | null
}

const initialState: AccountState = {
  creating: false,
  address: null,
  alias: null,
  avatar: null,
  isLocked: null,
  isInitialized: null,
}

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload
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
      state.alias = payload?.alias || null
      state.avatar = payload?.avatar || null
    },
    setAlias: (state, action: PayloadAction<string | null>) => {
      state.alias = action.payload
    },
    setAvatar: (state, action: PayloadAction<string | null>) => {
      state.avatar = action.payload
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

export const { setAddress, setKeyringStatus, setAlias, setAvatar } =
  accountSlice.actions

const reducer: Reducer<typeof initialState> = accountSlice.reducer
export default reducer

export const activeAccountSelector = ({ account }: RootState) => account.address

export const ownedObjects = createSelector(
  suiObjectsAdapterSelectors.selectAll,
  activeAccountSelector,
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

export function createAccountNftByIdSelector(nftId: ObjectId) {
  return createSelector(
    accountNftsSelector,
    (allNfts) =>
      allNfts.find((nft) => getObjectId(nft.reference) === nftId) || null
  )
}
