// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type SuiAddress, toB64, TransactionBlock } from '@mysten/sui.js'
import {
  SUI_CHAINS,
  ReadonlyWalletAccount,
  SUI_DEVNET_CHAIN,
  SUI_TESTNET_CHAIN,
  SUI_LOCALNET_CHAIN,
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
} from '_payloads/transactions'
import type { NetworkEnvType } from '_src/background/NetworkEnv'

type WalletEventsMap = {
  [E in keyof StandardEventsListeners]: Parameters<
    StandardEventsListeners[E]
  >[0]
}

// NOTE: Because this runs in a content script, we can't fetch the manifest.
const name = process.env.APP_NAME || 'Morphis Wallet'

// use @mysten/wallet-standard
const SUI_MAINNET_CHAIN = 'sui:mainnet' as const

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
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE5LjkzOTggNy4zOTYyM0MxOS45Mzk4IDcuMzU4NDkgMTkuOTI3OCA3LjMzMzMzIDE5LjkyNzggNy4zMjA3NVY3LjMwODE4QzE5LjkxNTcgNy4yODMwMiAxOS45MTU3IDcuMjU3ODYgMTkuOTAzNyA3LjI0NTI4QzE5Ljg5MTYgNy4yMjAxMiAxOS44Nzk2IDcuMjA3NTUgMTkuODY3NiA3LjE4MjM5TDE5Ljg1NTUgNy4xNjk4MUMxOS44NDM1IDcuMTU3MjMgMTkuODE5NCA3LjEzMjA3IDE5LjgwNzQgNy4xMTk1QzE5LjgwNzQgNy4xMTk1IDE5LjgwNzQgNy4xMTk1IDE5Ljc5NTMgNy4xMTk1QzE5Ljc4MzMgNy4xMDY5MiAxOS43NzEzIDcuMTA2OTIgMTkuNzU5MiA3LjA5NDM0TDE0LjcxNDggNC4wNTAzMUgxNC43MDI4QzE0LjY5MDcgNC4wMzc3NCAxNC42Nzg3IDQuMDM3NzMgMTQuNjY2NyA0LjAzNzczQzE0LjY1NDYgNC4wMzc3MyAxNC42NDI2IDQuMDI1MTUgMTQuNjMwNSA0LjAyNTE1QzE0LjYxODUgNC4wMjUxNSAxNC42MDY1IDQuMDEyNTggMTQuNTk0NCA0LjAxMjU4QzE0LjU4MjQgNC4wMTI1OCAxNC41NzA0IDQuMDEyNTggMTQuNTU4MyA0QzE0LjU0NjMgNCAxNC41MzQyIDQgMTQuNTIyMiA0QzE0LjUxMDIgNCAxNC40OTgxIDQgMTQuNDg2MSA0QzE0LjQ3NCA0IDE0LjQ2MiA0IDE0LjQ1IDQuMDEyNThDMTQuNDM3OSA0LjAxMjU4IDE0LjQyNTkgNC4wMTI1OCAxNC40MTM4IDQuMDI1MTVDMTQuNDAxOCA0LjAyNTE1IDE0LjM4OTggNC4wMzc3MyAxNC4zNzc3IDQuMDM3NzNDMTQuMzY1NyA0LjAzNzczIDE0LjM1MzYgNC4wNTAzMSAxNC4zNDE2IDQuMDUwMzFIMTQuMzI5Nkw5LjI4NTE4IDcuMDk0MzRMNC4yMDQ2NiAxMC4xMjU4QzQuMTgwNTkgMTAuMTM4NCA0LjE2ODU1IDEwLjE1MDkgNC4xNDQ0NyAxMC4xNjM1TDQuMTMyNDMgMTAuMTc2MUM0LjEyMDM5IDEwLjE4ODcgNC4wOTYzMSAxMC4yMTM4IDQuMDg0MjcgMTAuMjI2NEM0LjA3MjIzIDEwLjIzOSA0LjA2MDE5IDEwLjI2NDIgNC4wNDgxNiAxMC4yNzY3QzQuMDQ4MTYgMTAuMjc2NyA0LjA0ODE2IDEwLjI4OTMgNC4wMzYxMiAxMC4yODkzQzQuMDI0MDggMTAuMzE0NSA0LjAyNDA4IDEwLjMyNyA0LjAxMjA0IDEwLjM1MjJDNC4wMTIwNCAxMC4zNzc0IDQgMTAuNDAyNSA0IDEwLjQxNTFDNCAxMC40Mjc3IDQgMTAuNDI3NyA0IDEwLjQ0MDNWMTAuNDUyOFYxNi41NDA5QzQgMTYuNjkxOCA0LjA3MjIzIDE2LjgzMDIgNC4yMDQ2NiAxNi45MDU3TDkuMjQ5MDYgMTkuOTQ5N0M5LjMwOTI1IDE5Ljk4NzQgOS4zODE0OSAyMCA5LjQ1MzcyIDIwQzkuNTI1OTYgMjAgOS41ODYxNSAxOS45ODc0IDkuNjU4MzkgMTkuOTQ5N0M5Ljc3ODc4IDE5Ljg3NDIgOS44NjMwNSAxOS43MzU5IDkuODYzMDUgMTkuNTg0OVYxNC4yMTM4TDE0LjMxNzUgMTYuODkzMUMxNC4zNzc3IDE2LjkzMDggMTQuNDUgMTYuOTQzNCAxNC41MjIyIDE2Ljk0MzRDMTQuNTk0NCAxNi45NDM0IDE0LjY1NDYgMTYuOTMwOCAxNC43MjY5IDE2Ljg5MzFDMTQuODQ3MyAxNi44MTc2IDE0LjkzMTUgMTYuNjc5MiAxNC45MzE1IDE2LjUyODNWMTEuMTU3MkwxOS4zODYgMTMuODM2NUMxOS40NDYyIDEzLjg3NDIgMTkuNTE4NCAxMy44ODY4IDE5LjU5MDcgMTMuODg2OEMxOS42NjI5IDEzLjg4NjggMTkuNzIzMSAxMy44NzQyIDE5Ljc5NTMgMTMuODM2NUMxOS45MTU3IDEzLjc2MSAyMCAxMy42MjI2IDIwIDEzLjQ3MTdWNy4zODM2NUMxOS45Mzk4IDcuNDMzOTYgMTkuOTM5OCA3LjQwODgxIDE5LjkzOTggNy4zOTYyM1pNOS40NDE2OCAxMy4wNDRMNS4xOTE4NyAxMC40NzhMOS40NDE2OCA3LjkxMTk1TDEzLjY5MTUgMTAuNDc4TDkuNDQxNjggMTMuMDQ0Wk0xNC40OTgxIDEwTDEwLjI0ODMgNy40MzM5NkwxNC40OTgxIDQuODY3OTJMMTguNzQ3OSA3LjQzMzk2TDE0LjQ5ODEgMTBaTTkuMDQ0NCAxOC44OTMxTDQuNzk0NTggMTYuMzI3VjExLjE5NUw5LjA0NDQgMTMuNzYxVjE4Ljg5MzFaTTEwLjI0ODMgMTMuNTM0NkwxNC4xMDA4IDExLjIwNzVWMTUuODQ5MUwxMC4yNDgzIDEzLjUzNDZaTTE1LjI5MjcgMTAuNDkwNkwxOS4xNDUyIDguMTYzNTJWMTIuODA1TDE1LjI5MjcgMTAuNDkwNloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=' as `data:image/svg+xml;base64,${string}`
  }

  get chains() {
    // TODO: Extract chain from wallet:
    return SUI_CHAINS
  }

  get features(): StandardConnectFeature & StandardEventsFeature & SuiFeatures {
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
