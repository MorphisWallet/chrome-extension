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
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNTMiIHZpZXdCb3g9IjAgMCA3MiA1MyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQwLjY5MjQgMEMzOS40MjAzIDAgMzguMzg5MSAxLjAzNTQ1IDM4LjM4OTEgMi4zMTI3M1Y3LjMyMzY0QzM4LjM4OTEgOC42MDA5MyAzNy4zNTc5IDkuNjM2MzcgMzYuMDg1OCA5LjYzNjM3SDMxLjA5NTJDMjkuODIzMSA5LjYzNjM3IDI4Ljc5MTggOC42MDA5MyAyOC43OTE4IDcuMzIzNjRWMi4zMTI3M0MyOC43OTE4IDEuMDM1NDUgMjcuNzYwNiAwIDI2LjQ4ODUgMEgxMS45MDA2QzEwLjYyODUgMCA5LjU5NzI3IDEuMDM1NDUgOS41OTcyNyAyLjMxMjczVjcuMzIzNjRDOS41OTcyNyA4LjYwMDkzIDguNTY2MDMgOS42MzYzNyA3LjI5MzkzIDkuNjM2MzdIMi4zMDMzNUMxLjAzMTI0IDkuNjM2MzcgMCAxMC42NzE4IDAgMTEuOTQ5MVY0OC4xODE5SDkuNTk3MjdWMTEuOTQ5MUM5LjU5NzI3IDEwLjY3MTggMTAuNjI4NSA5LjYzNjM3IDExLjkwMDYgOS42MzYzN0gyNi40ODg1QzI3Ljc2MDYgOS42MzYzNyAyOC43OTE4IDEwLjY3MTggMjguNzkxOCAxMS45NDkxVjQ4LjE4MTlIMzguMzg5MVYxMS45NDkxQzM4LjM4OTEgMTAuNjcxOCAzOS40MjAzIDkuNjM2MzcgNDAuNjkyNCA5LjYzNjM3SDU1LjI4MDNDNTYuNTUyNCA5LjYzNjM3IDU3LjU4MzYgMTAuNjcxOCA1Ny41ODM2IDExLjk0OTFWNDguMTgxOUg2Ny4xODA5VjExLjk0OTFDNjcuMTgwOSAxMC42NzE4IDY2LjE0OTcgOS42MzYzNyA2NC44Nzc2IDkuNjM2MzdINTkuODg3QzU4LjYxNDkgOS42MzYzNyA1Ny41ODM2IDguNjAwOTMgNTcuNTgzNiA3LjMyMzY0VjIuMzEyNzNDNTcuNTgzNiAxLjAzNTQ1IDU2LjU1MjQgMCA1NS4yODAzIDBINDAuNjkyNFoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik00NS40OTEyIDQuODE4MThDNDQuMjE5MSA0LjgxODE4IDQzLjE4NzggNS44NTM2MyA0My4xODc4IDcuMTMwOTFWMTIuMTQxOEM0My4xODc4IDEzLjQxOTEgNDIuMTU2NiAxNC40NTQ2IDQwLjg4NDUgMTQuNDU0NkgzNS44OTM5QzM0LjYyMTggMTQuNDU0NiAzMy41OTA1IDEzLjQxOTEgMzMuNTkwNSAxMi4xNDE4VjcuMTMwOTFDMzMuNTkwNSA1Ljg1MzYzIDMyLjU1OTMgNC44MTgxOCAzMS4yODcyIDQuODE4MThIMTYuNjk5M0MxNS40MjcyIDQuODE4MTggMTQuMzk2IDUuODUzNjMgMTQuMzk2IDcuMTMwOTFWMTIuMTQxOEMxNC4zOTYgMTMuNDE5MSAxMy4zNjQ4IDE0LjQ1NDYgMTIuMDkyNyAxNC40NTQ2SDcuMTAyMDdDNS44Mjk5NyAxNC40NTQ2IDQuNzk4NzMgMTUuNDkgNC43OTg3MyAxNi43NjczVjUzSDE0LjM5NlYxNi43NjczQzE0LjM5NiAxNS40OSAxNS40MjcyIDE0LjQ1NDYgMTYuNjk5MyAxNC40NTQ2SDMxLjI4NzJDMzIuNTU5MyAxNC40NTQ2IDMzLjU5MDUgMTUuNDkgMzMuNTkwNSAxNi43NjczVjUzSDQzLjE4NzhWMTYuNzY3M0M0My4xODc4IDE1LjQ5IDQ0LjIxOTEgMTQuNDU0NiA0NS40OTEyIDE0LjQ1NDZINjAuMDc5QzYxLjM1MTEgMTQuNDU0NiA2Mi4zODI0IDE1LjQ5IDYyLjM4MjQgMTYuNzY3M1Y1M0g3MS45Nzk2VjE2Ljc2NzNDNzEuOTc5NiAxNS40OSA3MC45NDg0IDE0LjQ1NDYgNjkuNjc2MyAxNC40NTQ2SDY0LjY4NTdDNjMuNDEzNiAxNC40NTQ2IDYyLjM4MjQgMTMuNDE5MSA2Mi4zODI0IDEyLjE0MThWNy4xMzA5MUM2Mi4zODI0IDUuODUzNjMgNjEuMzUxMSA0LjgxODE4IDYwLjA3OSA0LjgxODE4SDQ1LjQ5MTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTQ1LjQ5MTIgNS4zOTYzNkM0NC41MzcxIDUuMzk2MzYgNDMuNzYzNyA2LjE3Mjk1IDQzLjc2MzcgNy4xMzA5MVYxMi4xNDE4QzQzLjc2MzcgMTMuNzM4NCA0Mi40NzQ2IDE1LjAzMjcgNDAuODg0NSAxNS4wMzI3SDM1Ljg5MzlDMzQuMzAzOCAxNS4wMzI3IDMzLjAxNDcgMTMuNzM4NCAzMy4wMTQ3IDEyLjE0MThWNy4xMzA5MUMzMy4wMTQ3IDYuMTcyOTUgMzIuMjQxMyA1LjM5NjM2IDMxLjI4NzIgNS4zOTYzNkgxNi42OTkzQzE1Ljc0NTMgNS4zOTYzNiAxNC45NzE4IDYuMTcyOTUgMTQuOTcxOCA3LjEzMDkxVjEyLjE0MThDMTQuOTcxOCAxMy43Mzg0IDEzLjY4MjggMTUuMDMyNyAxMi4wOTI3IDE1LjAzMjdINy4xMDIwN0M2LjE0Nzk5IDE1LjAzMjcgNS4zNzQ1NiAxNS44MDkzIDUuMzc0NTYgMTYuNzY3M1Y1Mi40MjE5SDEzLjgyMDJWMTYuNzY3M0MxMy44MjAyIDE1LjE3MDcgMTUuMTA5MiAxMy44NzY0IDE2LjY5OTMgMTMuODc2NEgzMS4yODcyQzMyLjg3NzMgMTMuODc2NCAzNC4xNjY0IDE1LjE3MDcgMzQuMTY2NCAxNi43NjczVjUyLjQyMTlINDIuNjEyVjE2Ljc2NzNDNDIuNjEyIDE1LjE3MDcgNDMuOTAxIDEzLjg3NjQgNDUuNDkxMiAxMy44NzY0SDYwLjA3OUM2MS42NjkxIDEzLjg3NjQgNjIuOTU4MiAxNS4xNzA3IDYyLjk1ODIgMTYuNzY3M1Y1Mi40MjE5SDcxLjQwMzhWMTYuNzY3M0M3MS40MDM4IDE1LjgwOTMgNzAuNjMwNCAxNS4wMzI3IDY5LjY3NjMgMTUuMDMyN0g2NC42ODU3QzYzLjA5NTYgMTUuMDMyNyA2MS44MDY1IDEzLjczODQgNjEuODA2NSAxMi4xNDE4VjcuMTMwOTFDNjEuODA2NSA2LjE3Mjk1IDYxLjAzMzEgNS4zOTYzNiA2MC4wNzkgNS4zOTYzNkg0NS40OTEyWk0zMy41OTA1IDUzVjE2Ljc2NzNDMzMuNTkwNSAxNS40OSAzMi41NTkzIDE0LjQ1NDYgMzEuMjg3MiAxNC40NTQ2SDE2LjY5OTNDMTUuNDI3MiAxNC40NTQ2IDE0LjM5NiAxNS40OSAxNC4zOTYgMTYuNzY3M1Y1M0g0Ljc5ODczVjE2Ljc2NzNDNC43OTg3MyAxNS40OSA1LjgyOTk3IDE0LjQ1NDYgNy4xMDIwNyAxNC40NTQ2SDEyLjA5MjdDMTMuMzY0OCAxNC40NTQ2IDE0LjM5NiAxMy40MTkxIDE0LjM5NiAxMi4xNDE4VjcuMTMwOTFDMTQuMzk2IDUuODUzNjMgMTUuNDI3MiA0LjgxODE4IDE2LjY5OTMgNC44MTgxOEgzMS4yODcyQzMyLjU1OTMgNC44MTgxOCAzMy41OTA1IDUuODUzNjMgMzMuNTkwNSA3LjEzMDkxVjEyLjE0MThDMzMuNTkwNSAxMy40MTkxIDM0LjYyMTggMTQuNDU0NiAzNS44OTM5IDE0LjQ1NDZINDAuODg0NUM0Mi4xNTY2IDE0LjQ1NDYgNDMuMTg3OCAxMy40MTkxIDQzLjE4NzggMTIuMTQxOFY3LjEzMDkxQzQzLjE4NzggNS44NTM2MyA0NC4yMTkxIDQuODE4MTggNDUuNDkxMiA0LjgxODE4SDYwLjA3OUM2MS4zNTExIDQuODE4MTggNjIuMzgyNCA1Ljg1MzYzIDYyLjM4MjQgNy4xMzA5MVYxMi4xNDE4QzYyLjM4MjQgMTMuNDE5MSA2My40MTM2IDE0LjQ1NDYgNjQuNjg1NyAxNC40NTQ2SDY5LjY3NjNDNzAuOTQ4NCAxNC40NTQ2IDcxLjk3OTYgMTUuNDkgNzEuOTc5NiAxNi43NjczVjUzSDYyLjM4MjRWMTYuNzY3M0M2Mi4zODI0IDE1LjQ5IDYxLjM1MTEgMTQuNDU0NiA2MC4wNzkgMTQuNDU0Nkg0NS40OTEyQzQ0LjIxOTEgMTQuNDU0NiA0My4xODc4IDE1LjQ5IDQzLjE4NzggMTYuNzY3M1Y1M0gzMy41OTA1WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTQuNzk4NzMgNTNMMCA0OC4xODE5TDQuNzk4NzMgNDguMTgxOFY1M1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0zMy41OTA1IDUzTDI4Ljc5MTggNDguMTgxOUwzMy41OTA1IDQ4LjE4MThMMzMuNTkwNSA1M1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik02Mi4zODI0IDUzTDU3LjU4MzYgNDguMTgxOUw2Mi4zODIzIDQ4LjE4MThMNjIuMzgyNCA1M1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik05LjU5NzI3IDExLjk0OTFDOS41OTcyNyAxMC42NzE4IDEwLjYyODUgOS42MzYzNyAxMS45MDA2IDkuNjM2MzdMMTQuMzk2IDkuNjM2NjZMMTQuMzk2IDEyLjE0MThDMTQuMzk2IDEzLjQxOTEgMTMuMzY0OCAxNC40NTQ2IDEyLjA5MjcgMTQuNDU0Nkw5LjU5NzM2IDE0LjQ1NDhMOS41OTcyNyAxMS45NDkxWiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTM4LjM4OTEgMTEuOTQ5MUMzOC4zODkxIDEwLjY3MTggMzkuNDIwMyA5LjYzNjM3IDQwLjY5MjQgOS42MzYzN0w0My4xODc5IDkuNjM2NjZMNDMuMTg3OCAxMi4xNDE4QzQzLjE4NzggMTMuNDE5MSA0Mi4xNTY2IDE0LjQ1NDYgNDAuODg0NSAxNC40NTQ2TDM4LjM4OTIgMTQuNDU0OEwzOC4zODkxIDExLjk0OTFaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K' as `data:image/svg+xml;base64,${string}`
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
