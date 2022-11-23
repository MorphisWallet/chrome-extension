// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { filter, lastValueFrom, map, race, Subject, take } from 'rxjs'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { Window } from './Window'

import type { ContentScriptConnection } from './connections/ContentScriptConnection'
import type { SignMessageRequest } from '_payloads/messages/SignMessageRequest'
import type { SignMessageRequestResponse } from '_payloads/messages/ui/SignMessageRequestResponse'

const MESSAGES_STORE_KEY = 'sign-messages'

function openSignMessageWindow(signMessageRequestID: string) {
  return new Window({
    url:
      Browser.runtime.getURL('ui.html') +
      `#/sign-message-approval/${encodeURIComponent(signMessageRequestID)}`,
  })
}

class Messages {
  private _signMessageResponseMessages =
    new Subject<SignMessageRequestResponse>()

  async signMessage(
    messageData: string | undefined,
    messageString: string | undefined,
    connection: ContentScriptConnection
  ) {
    const signMessageRequest = this.createSignMessageRequest(
      messageData,
      messageString,
      connection.origin,
      connection.originFavIcon
    )
    await this.storeSignMessageRequest(signMessageRequest)
    const popUp = openSignMessageWindow(signMessageRequest.id)
    const popUpClose = (await popUp.show()).pipe(
      take(1),
      map<number, false>(() => false)
    )
    const signMessageResponseMessage = this._signMessageResponseMessages.pipe(
      filter((msg) => msg.signMessageRequestID === signMessageRequest.id),
      take(1)
    )
    return lastValueFrom(
      race(popUpClose, signMessageResponseMessage).pipe(
        take(1),
        map(async (response) => {
          if (response && response.approved) {
            const { approved, signature } = response
            signMessageRequest.approved = approved
            signMessageRequest.signature = signature
            await this.storeSignMessageRequest(signMessageRequest)
            return signature
          }
          await this.removeSignMessageRequest(signMessageRequest.id)
          throw new Error('Sign Message Request rejected from user')
        })
      )
    )
  }

  public handleMessage(msg: SignMessageRequestResponse) {
    this._signMessageResponseMessages.next(msg)
  }

  private createSignMessageRequest(
    messageData: string | undefined,
    messageString: string | undefined,
    origin: string,
    originFavIcon?: string
  ): SignMessageRequest {
    if (messageData !== undefined) {
      return {
        id: uuidV4(),
        approved: null,
        origin,
        originFavIcon,
        messageData,
        messageString,
        createdDate: new Date().toISOString(),
      }
    }
    throw new Error('Message must be defined.')
  }

  public async getSignMessageRequests(): Promise<
    Record<string, SignMessageRequest>
  > {
    return (await Browser.storage.local.get({ [MESSAGES_STORE_KEY]: {} }))[
      MESSAGES_STORE_KEY
    ]
  }

  private async saveSignMessageRequests(
    signMessageRequests: Record<string, SignMessageRequest>
  ) {
    await Browser.storage.local.set({
      [MESSAGES_STORE_KEY]: signMessageRequests,
    })
  }

  private async storeSignMessageRequest(
    signMessageRequest: SignMessageRequest
  ) {
    const messages = await this.getSignMessageRequests()
    messages[signMessageRequest.id] = signMessageRequest
    await this.saveSignMessageRequests(messages)
  }

  private async removeSignMessageRequest(signMessageRequestId: string) {
    const messages = await this.getSignMessageRequests()
    delete messages[signMessageRequestId]
    await this.saveSignMessageRequests(messages)
  }
}

export default new Messages()
