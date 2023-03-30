// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import Browser from 'webextension-polyfill'

const WALLET_VERSION = Browser.runtime.getManifest().version
const SENTRY_DSN = process.env.SENTRY_DSN
const IS_PROD = process.env.NODE_ENV === 'production'

export default function initSentry() {
  Sentry.init({
    enabled: IS_PROD,
    dsn: SENTRY_DSN,
    integrations: [new BrowserTracing()],
    release: WALLET_VERSION,
    tracesSampleRate: 0.2,
  })
}

// expand this breadcrumb
type Breadcrumbs = {
  type: 'debug'
  category: string
  message: string
}

export function addSentryBreadcrumb(breadcrumbs: Breadcrumbs) {
  Sentry.addBreadcrumb(breadcrumbs)
}

export function reportSentryError(error: Error) {
  Sentry.captureException(error)
}
