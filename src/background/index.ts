// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// import { lte, coerce } from 'semver'
import Browser from 'webextension-polyfill'

import { lock, on } from './Accounts'
import { LOCK_ALARM_NAME } from './Alarms'
import Permissions from './Permissions'
import { Connections } from './connections'
import { openInNewTab } from '_shared/utils'
// import { MSG_CONNECT } from '_src/content-script/keep-bg-alive'

Browser.runtime.onInstalled.addListener(
  async ({ reason /* previousVersion */ }) => {
    // TODO: Our versions don't use semver, and instead are date-based. Instead of using the semver
    // library, we can use some combination of parsing into a date + inspecting patch.
    // const previousVersionSemver = coerce(previousVersion)?.version

    if (reason === 'install') {
      openInNewTab()
    } else if (reason === 'update') {
      // clear everything in the storage
      // mainly done to clear the mnemonic that was stored
      // as plain text
      // await Browser.storage.local.clear()
    }
  }
)

const connections = new Connections()

Permissions.permissionReply.subscribe((permission) => {
  if (permission) {
    connections.notifyForPermissionReply(permission)
  }
})

on('lockedStatusUpdate', (isLocked: boolean) => {
  connections.notifyForLockedStatusUpdate(isLocked)
})

Browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === LOCK_ALARM_NAME) {
    lock()
  }
})
