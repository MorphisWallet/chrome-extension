// // Copyright (c) Mysten Labs, Inc.
// // SPDX-License-Identifier: Apache-2.0

import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import { queryClient } from '_app/helpers/queryClient'
import initSentry from '_src/shared/sentry'

import store from '_store'
import { thunkExtras } from '_store/thunk-extras'
import { initAppType, initNetworkFromStorage } from '_redux/slices/app'
import { getFromLocationSearch } from '_redux/slices/app/AppType'

import ErrorBoundary from './ErrorBoundary'
import App from './App'

import './global.css'

async function init() {
  if (process.env.NODE_ENV === 'development') {
    Object.defineProperty(window, 'store', { value: store })
  }
  store.dispatch(initAppType(getFromLocationSearch()))
  await store.dispatch(initNetworkFromStorage()).unwrap()
  await thunkExtras.background.init(store.dispatch)
}

const renderApp = () => {
  const rootDom = document.getElementById('root')
  if (!rootDom) {
    throw new Error('Root element not found')
  }
  const root = createRoot(rootDom)
  root.render(
    // TODO: intl
    <IntlProvider locale="en">
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </QueryClientProvider>
      </Provider>
    </IntlProvider>
  )
}

;(async () => {
  await init()
  initSentry()
  renderApp()
})()
