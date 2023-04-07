// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { QueryClientProvider } from '@tanstack/react-query'
import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import { initAppType } from '_redux/slices/app'
import { getFromLocationSearch } from '_redux/slices/app/AppType'
import store from '_store'
import { api, thunkExtras } from '_store/thunk-extras'

import App from './App'
import ErrorBoundary from './ErrorBoundary'

import { RpcClientContext } from './core'

import { queryClient } from './app/helpers/queryClient'
import { useAppSelector } from './app/hooks'
import initSentry from '_src/shared/sentry'

import './global.css'
import 'react-toastify/dist/ReactToastify.min.css'
import 'react-tooltip/dist/react-tooltip.css'

async function init() {
  if (process.env.NODE_ENV === 'development') {
    Object.defineProperty(window, 'store', { value: store })
  }
  store.dispatch(initAppType(getFromLocationSearch(window.location.search)))
  await thunkExtras.background.init(store.dispatch)
}

function renderApp() {
  const rootDom = document.getElementById('root')
  if (!rootDom) {
    throw new Error('Root element not found')
  }
  const root = createRoot(rootDom)
  root.render(
    <StrictMode>
      <Provider store={store}>
        <AppWrapper />
      </Provider>
    </StrictMode>
  )
}

function AppWrapper() {
  const network = useAppSelector(
    ({ app: { apiEnv, customRPC } }) => `${apiEnv}_${customRPC}`
  )

  return (
    <IntlProvider locale={navigator.language}>
      <Fragment key={network}>
        <QueryClientProvider client={queryClient}>
          <RpcClientContext.Provider value={api.instance.fullNode}>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </RpcClientContext.Provider>
        </QueryClientProvider>
      </Fragment>
    </IntlProvider>
  )
}

;(async () => {
  await init()
  initSentry()
  renderApp()
})()
