// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type SuiAddress, toB64, TransactionBlock } from '@mysten/sui.js'
import {
  SUI_CHAINS,
  ReadonlyWalletAccount,
  SUI_DEVNET_CHAIN,
  SUI_TESTNET_CHAIN,
  SUI_LOCALNET_CHAIN,
  SUI_MAINNET_CHAIN,
  type SuiFeatures,
  type SuiSignAndExecuteTransactionBlockMethod,
  type StandardConnectFeature,
  type StandardConnectMethod,
  type Wallet,
  type StandardEventsFeature,
  type StandardEventsOnMethod,
  type StandardEventsListeners,
  type SuiSignTransactionBlockMethod,
  type SuiSignMessageMethod,
} from '@mysten/wallet-standard'
import mitt, { type Emitter } from 'mitt'
import { filter, map, type Observable } from 'rxjs'

import { mapToPromise } from './utils'
import { createMessage } from '_messages'
import { WindowMessageStream } from '_messaging/WindowMessageStream'
import {
  type AcquirePermissionsRequest,
  type AcquirePermissionsResponse,
  type HasPermissionsRequest,
  type HasPermissionsResponse,
  ALL_PERMISSION_TYPES,
} from '_payloads/permissions'
import { API_ENV } from '_src/shared/api-env'
import { type SignMessageRequest } from '_src/shared/messaging/messages/payloads/transactions/SignMessage'
import { isWalletStatusChangePayload } from '_src/shared/messaging/messages/payloads/wallet-status-change'

import type { BasePayload, Payload } from '_payloads'
import type { GetAccount } from '_payloads/account/GetAccount'
import type { GetAccountResponse } from '_payloads/account/GetAccountResponse'
import type { SetNetworkPayload } from '_payloads/network'
import type {
  ExecuteTransactionRequest,
  ExecuteTransactionResponse,
  SignTransactionRequest,
  SignTransactionResponse,
  StakeRequest,
} from '_payloads/transactions'
import type { NetworkEnvType } from '_src/background/NetworkEnv'

type WalletEventsMap = {
  [E in keyof StandardEventsListeners]: Parameters<
    StandardEventsListeners[E]
  >[0]
}

// NOTE: Because this runs in a content script, we can't fetch the manifest.
const name = process.env.APP_NAME || 'Morphis Wallet'

type ChainType = Wallet['chains'][number]
const API_ENV_TO_CHAIN: Record<
  Exclude<API_ENV, API_ENV.customRPC>,
  ChainType
> = {
  [API_ENV.local]: SUI_LOCALNET_CHAIN,
  [API_ENV.devNet]: SUI_DEVNET_CHAIN,
  [API_ENV.testNet]: SUI_TESTNET_CHAIN,
  [API_ENV.mainnet]: SUI_MAINNET_CHAIN,
}

type StakeInput = { validatorAddress: string }
type SuiWalletStakeFeature = {
  'suiWallet:stake': {
    version: '0.0.1'
    stake: (input: StakeInput) => Promise<void>
  }
}

export class SuiWallet implements Wallet {
  readonly #events: Emitter<WalletEventsMap>
  readonly #version = '1.0.0' as const
  readonly #name = name
  #accounts: ReadonlyWalletAccount[]
  #messagesStream: WindowMessageStream
  #activeChain: ChainType | null = null

  get version() {
    return this.#version
  }

  get name() {
    return this.#name
  }

  get icon() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgwIiBoZWlnaHQ9IjM3OSIgdmlld0JveD0iMCAwIDM4MCAzNzkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMDMuMjU3IDExNS41MjFDMTk5LjY3MSAxMTUuNTIxIDE5Ni43NjQgMTE4LjQyOCAxOTYuNzY0IDEyMi4wMTRWMTM2LjA4M0MxOTYuNzY0IDEzOS42NjkgMTkzLjg1NyAxNDIuNTc3IDE5MC4yNzEgMTQyLjU3N0gxNzYuMjAxQzE3Mi42MTUgMTQyLjU3NyAxNjkuNzA4IDEzOS42NjkgMTY5LjcwOCAxMzYuMDgzVjEyMi4wMTRDMTY5LjcwOCAxMTguNDI4IDE2Ni44MDEgMTE1LjUyMSAxNjMuMjE1IDExNS41MjFIMTIyLjA4OUMxMTguNTAzIDExNS41MjEgMTE1LjU5NiAxMTguNDI4IDExNS41OTYgMTIyLjAxNFYxMzYuMDgzQzExNS41OTYgMTM5LjY2OSAxMTIuNjg5IDE0Mi41NzcgMTA5LjEwMyAxNDIuNTc3SDk1LjAzMzVDOTEuNDQ3MyAxNDIuNTc3IDg4LjU0IDE0NS40ODQgODguNTQgMTQ5LjA3VjI1MC44MDFIMTE1LjU5NlYxNDkuMDdDMTE1LjU5NiAxNDUuNDg0IDExOC41MDMgMTQyLjU3NyAxMjIuMDg5IDE0Mi41NzdIMTYzLjIxNUMxNjYuODAxIDE0Mi41NzcgMTY5LjcwOCAxNDUuNDg0IDE2OS43MDggMTQ5LjA3VjI1MC44MDFIMTk2Ljc2NFYxNDkuMDdDMTk2Ljc2NCAxNDUuNDg0IDE5OS42NzEgMTQyLjU3NyAyMDMuMjU3IDE0Mi41NzdIMjQ0LjM4M0MyNDcuOTY5IDE0Mi41NzcgMjUwLjg3NiAxNDUuNDg0IDI1MC44NzYgMTQ5LjA3VjI1MC44MDFIMjc3LjkzMlYxNDkuMDdDMjc3LjkzMiAxNDUuNDg0IDI3NS4wMjUgMTQyLjU3NyAyNzEuNDM5IDE0Mi41NzdIMjU3LjM2OUMyNTMuNzgzIDE0Mi41NzcgMjUwLjg3NiAxMzkuNjY5IDI1MC44NzYgMTM2LjA4M1YxMjIuMDE0QzI1MC44NzYgMTE4LjQyOCAyNDcuOTY5IDExNS41MjEgMjQ0LjM4MyAxMTUuNTIxSDIwMy4yNTdaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMjExLjEwNCAxMzUuNTQxQzIxMS4xMDQgMTMyLjQwMyAyMTMuNjQ3IDEyOS44NiAyMTYuNzg1IDEyOS44NkgyNTcuOTFDMjYxLjA0OCAxMjkuODYgMjYzLjU5MiAxMzIuNDAzIDI2My41OTIgMTM1LjU0MVYxNDkuNjFDMjYzLjU5MiAxNTMuNjQ1IDI2Ni44NjMgMTU2LjkxNiAyNzAuODk3IDE1Ni45MTZIMjg0Ljk2NkMyODguMTA0IDE1Ni45MTYgMjkwLjY0OCAxNTkuNDU5IDI5MC42NDggMTYyLjU5N1YyNjMuNTE2SDI2NS4yMTZWMTYyLjU5N0MyNjUuMjE2IDE1OC41NjMgMjYxLjk0NSAxNTUuMjkyIDI1Ny45MSAxNTUuMjkySDIxNi43ODVDMjEyLjc1MSAxNTUuMjkyIDIwOS40OCAxNTguNTYzIDIwOS40OCAxNjIuNTk3VjI2My41MTZIMTg0LjA0OFYxNjIuNTk3QzE4NC4wNDggMTU4LjU2MyAxODAuNzc3IDE1NS4yOTIgMTc2Ljc0MiAxNTUuMjkySDEzNS42MTdDMTMxLjU4MyAxNTUuMjkyIDEyOC4zMTIgMTU4LjU2MyAxMjguMzEyIDE2Mi41OTdWMjYzLjUxNkgxMDIuODhWMTYyLjU5N0MxMDIuODggMTU5LjQ1OSAxMDUuNDIzIDE1Ni45MTYgMTA4LjU2MSAxNTYuOTE2SDEyMi42M0MxMjYuNjY1IDE1Ni45MTYgMTI5LjkzNiAxNTMuNjQ1IDEyOS45MzYgMTQ5LjYxVjEzNS41NDFDMTI5LjkzNiAxMzIuNDAzIDEzMi40NzkgMTI5Ljg2IDEzNS42MTcgMTI5Ljg2SDE3Ni43NDJDMTc5Ljg4IDEyOS44NiAxODIuNDI0IDEzMi40MDMgMTgyLjQyNCAxMzUuNTQxVjE0OS42MUMxODIuNDI0IDE1My42NDUgMTg1LjY5NSAxNTYuOTE2IDE4OS43MjkgMTU2LjkxNkgyMDMuNzk4QzIwNy44MzMgMTU2LjkxNiAyMTEuMTA0IDE1My42NDUgMjExLjEwNCAxNDkuNjFWMTM1LjU0MVoiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEuNjIzMzYiLz4KPHBhdGggZD0iTTEwMi4wNjggMjY0LjMyOEw5NS4zMDM5IDI1Ny41NjRMODguNTM5OSAyNTAuOEgxMDIuMDY4VjI2NC4zMjhaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMTgzLjIzNiAyNjQuMzI4TDE3Ni40NzIgMjU3LjU2NEwxNjkuNzA4IDI1MC44SDE4My4yMzZWMjY0LjMyOFoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0yNjQuNDA0IDI2NC4zMjhMMjU3LjY0IDI1Ny41NjRMMjUwLjg3NiAyNTAuOEgyNjQuNDA0VjI2NC4zMjhaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMTE1LjU5NiAxNDkuMDdDMTE1LjU5NiAxNDUuNDg0IDExOC41MDMgMTQyLjU3NiAxMjIuMDkgMTQyLjU3NkgxMjkuMTI0VjE0OS42MTFDMTI5LjEyNCAxNTMuMTk3IDEyNi4yMTcgMTU2LjEwNCAxMjIuNjMxIDE1Ni4xMDRIMTE1LjU5NlYxNDkuMDdaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMTk2Ljc2NCAxNDkuMDdDMTk2Ljc2NCAxNDUuNDg0IDE5OS42NzEgMTQyLjU3NiAyMDMuMjU4IDE0Mi41NzZIMjEwLjI5MlYxNDkuNjExQzIxMC4yOTIgMTUzLjE5NyAyMDcuMzg1IDE1Ni4xMDQgMjAzLjc5OSAxNTYuMTA0SDE5Ni43NjRWMTQ5LjA3WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg==' as `data:image/svg+xml;base64,${string}`
  }

  get chains() {
    // TODO: Extract chain from wallet:
    return SUI_CHAINS
  }

  get features(): StandardConnectFeature &
    StandardEventsFeature &
    SuiFeatures &
    SuiWalletStakeFeature {
    return {
      'standard:connect': {
        version: '1.0.0',
        connect: this.#connect,
      },
      'standard:events': {
        version: '1.0.0',
        on: this.#on,
      },
      'sui:signTransactionBlock': {
        version: '1.0.0',
        signTransactionBlock: this.#signTransactionBlock,
      },
      'sui:signAndExecuteTransactionBlock': {
        version: '1.0.0',
        signAndExecuteTransactionBlock: this.#signAndExecuteTransactionBlock,
      },
      'sui:signMessage': {
        version: '1.0.0',
        signMessage: this.#signMessage,
      },
      'suiWallet:stake': {
        version: '0.0.1',
        stake: this.#stake,
      },
    }
  }

  get accounts() {
    return this.#accounts
  }

  #setAccounts(addresses: SuiAddress[]) {
    this.#accounts = addresses.map(
      (address) =>
        new ReadonlyWalletAccount({
          address,
          // TODO: Expose public key instead of address:
          publicKey: new Uint8Array(),
          chains: this.#activeChain ? [this.#activeChain] : [],
          features: ['sui:signAndExecuteTransaction'],
        })
    )
  }

  constructor() {
    this.#events = mitt()
    this.#accounts = []
    this.#messagesStream = new WindowMessageStream(
      'morphis_in-page',
      'morphis_content-script'
    )
    this.#messagesStream.messages.subscribe(({ payload }) => {
      if (isWalletStatusChangePayload(payload)) {
        const { network, accounts } = payload
        if (network) {
          this.#setActiveChain(network)
          if (!accounts) {
            // in case an accounts change exists skip updating chains of current accounts
            // accounts will be updated in the if block below
            this.#accounts = this.#accounts.map(
              ({ address, features, icon, label, publicKey }) =>
                new ReadonlyWalletAccount({
                  address,
                  publicKey,
                  chains: this.#activeChain ? [this.#activeChain] : [],
                  features,
                  label,
                  icon,
                })
            )
          }
        }
        if (accounts) {
          this.#setAccounts(accounts)
        }
        this.#events.emit('change', { accounts: this.accounts })
      }
    })
    this.#connected()
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    this.#events.on(event, listener)
    return () => this.#events.off(event, listener)
  }

  #connected = async () => {
    this.#setActiveChain(await this.#getActiveNetwork())
    if (!(await this.#hasPermissions(['viewAccount']))) {
      return
    }
    const accounts = await this.#getAccounts()
    this.#setAccounts(accounts)
    if (this.#accounts.length) {
      this.#events.emit('change', { accounts: this.accounts })
    }
  }

  #connect: StandardConnectMethod = async (input) => {
    if (!input?.silent) {
      await mapToPromise(
        this.#send<AcquirePermissionsRequest, AcquirePermissionsResponse>({
          type: 'acquire-permissions-request',
          permissions: ALL_PERMISSION_TYPES,
        }),
        (response) => response.result
      )
    }

    await this.#connected()

    return { accounts: this.accounts }
  }

  #signTransactionBlock: SuiSignTransactionBlockMethod = async (input) => {
    if (!TransactionBlock.is(input.transactionBlock)) {
      throw new Error(
        'Unexpect transaction format found. Ensure that you are using the `Transaction` class.'
      )
    }

    return mapToPromise(
      this.#send<SignTransactionRequest, SignTransactionResponse>({
        type: 'sign-transaction-request',
        transaction: {
          ...input,
          // account might be undefined if previous version of adapters is used
          // in that case use the first account address
          account: input.account?.address || this.#accounts[0]?.address || '',
          transaction: input.transactionBlock.serialize(),
        },
      }),
      (response) => response.result
    )
  }

  #signAndExecuteTransactionBlock: SuiSignAndExecuteTransactionBlockMethod =
    async (input) => {
      if (!TransactionBlock.is(input.transactionBlock)) {
        throw new Error(
          'Unexpect transaction format found. Ensure that you are using the `Transaction` class.'
        )
      }

      return mapToPromise(
        this.#send<ExecuteTransactionRequest, ExecuteTransactionResponse>({
          type: 'execute-transaction-request',
          transaction: {
            type: 'transaction',
            data: input.transactionBlock.serialize(),
            options: input.options,
            // account might be undefined if previous version of adapters is used
            // in that case use the first account address
            account: input.account?.address || this.#accounts[0]?.address || '',
          },
        }),
        (response) => response.result
      )
    }

  #signMessage: SuiSignMessageMethod = async ({ message, account }) => {
    return mapToPromise(
      this.#send<SignMessageRequest, SignMessageRequest>({
        type: 'sign-message-request',
        args: {
          message: toB64(message),
          accountAddress: account.address,
        },
      }),
      (response) => {
        if (!response.return) {
          throw new Error('Invalid sign message response')
        }
        return response.return
      }
    )
  }

  #stake = async (input: StakeInput) => {
    this.#send<StakeRequest, void>({
      type: 'stake-request',
      validatorAddress: input.validatorAddress,
    })
  }

  #hasPermissions(permissions: HasPermissionsRequest['permissions']) {
    return mapToPromise(
      this.#send<HasPermissionsRequest, HasPermissionsResponse>({
        type: 'has-permissions-request',
        permissions: permissions,
      }),
      ({ result }) => result
    )
  }

  #getAccounts() {
    return mapToPromise(
      this.#send<GetAccount, GetAccountResponse>({
        type: 'get-account',
      }),
      (response) => response.accounts
    )
  }

  #getActiveNetwork() {
    return mapToPromise(
      this.#send<BasePayload, SetNetworkPayload>({
        type: 'get-network',
      }),
      ({ network }) => network
    )
  }

  #setActiveChain({ env }: NetworkEnvType) {
    this.#activeChain =
      env === API_ENV.customRPC ? 'sui:unknown' : API_ENV_TO_CHAIN[env]
  }

  #send<
    RequestPayload extends Payload,
    ResponsePayload extends Payload | void = void
  >(
    payload: RequestPayload,
    responseForID?: string
  ): Observable<ResponsePayload> {
    const msg = createMessage(payload, responseForID)
    this.#messagesStream.send(msg)
    return this.#messagesStream.messages.pipe(
      filter(({ id }) => id === msg.id),
      map((msg) => msg.payload as ResponsePayload)
    )
  }
}
