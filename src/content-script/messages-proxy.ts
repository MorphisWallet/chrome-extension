// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { take } from 'rxjs'

import { PortStream } from '_messaging/PortStream'
import { WindowMessageStream } from '_messaging/WindowMessageStream'

import type { Message } from '_src/shared/messaging/messages'

function createPort(
  windowMsgStream: WindowMessageStream,
  currentMsg?: Message
) {
  const port = PortStream.connectToBackgroundService(
    'morphis_content<->background'
  )
  if (currentMsg) {
    port.sendMessage(currentMsg)
  }
  port.onMessage.subscribe((msg) => {
    windowMsgStream.send(msg)
  })
  const windowMsgSub = windowMsgStream.messages.subscribe((msg) => {
    port.sendMessage(msg)
  })
  port.onDisconnect.subscribe(() => {
    windowMsgSub.unsubscribe()
    createPort(windowMsgStream)
  })
}

export function setupMessagesProxy() {
  const windowMsgStream = new WindowMessageStream(
    'morphis_content-script',
    'morphis_in-page'
  )
  windowMsgStream.messages.pipe(take(1)).subscribe((msg) => {
    createPort(windowMsgStream, msg)
  })
}
