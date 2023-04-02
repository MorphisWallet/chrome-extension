import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'

import ProtectedRouter from '_app/ProtectedRouter'

import LandingPage from '_app/pages/landing'
import CoinDetailPage from '_app/pages/landing/coin_detail'
import SendPage from '_app/pages/send'

import NftPage from '_app/pages/nft'
import NftDetailPage from '_app/pages/nft/nft_detail'
import NftSend from '_app/pages/nft/nft_send'

import DiscoveryPage from './app/pages/discovery'

import HistoryPage from '_app/pages/history'

// import SettingsPage from '_app/pages/settings'
// import SapPage from '_app/pages/settings/sap'
// import WalletManagementPage from '_app/pages/settings/wallet_management'
// import UpdateWalletMetaPage from '_app/pages/settings/wallet_management/update_wallet_meta'
// import SeedPhrasePage from '_app/pages/settings/sap/seed_phrase'
// import ExportPrivateKeyPage from '_app/pages/settings/sap/export_private_key'
// import ChangePasswordPage from '_app/pages/settings/sap/change_password'

import ConnectPage from '_app/pages/dapp/connect'
// import TxApprovalPage from '_app/pages/dapp/tx_approval'

import InitializePage from '_app/pages/initialize'
import CreatePage from '_app/pages/initialize/create'
import BackupPage from '_app/pages/initialize/backup'
import DonePage from '_app/pages/initialize/done'
import ImportPage from '_app/pages/initialize/import'

import WelcomePage from '_app/pages/welcome'
import LockedPage from '_app/pages/locked'
import NotFound from '_app/pages/not_found'

const router = createHashRouter([
  {
    path: '/*',
    element: <ProtectedRouter />,
    children: [
      {
        path: '',
        element: <Navigate to="/landing" replace={true} />,
      },
      {
        path: 'landing/',
        element: <LandingPage />,
      },
      {
        path: 'landing/:coin',
        element: <CoinDetailPage />,
      },
      {
        path: 'send',
        element: <SendPage />,
      },
      {
        path: 'nft',
        element: <NftPage />,
      },
      {
        path: 'nft/:objectId',
        element: <NftDetailPage />,
        children: [
          {
            path: 'send',
            element: <NftSend />,
          },
        ],
      },
      {
        path: 'discovery',
        element: <DiscoveryPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      // {
      //   path: 'settings',
      //   element: <SettingsPage />,
      // },
      // {
      //   path: 'settings/sap',
      //   element: <SapPage />,
      // },
      // {
      //   path: 'settings/wallet-management',
      //   element: <WalletManagementPage />,
      // },
      // {
      //   path: 'settings/wallet-management/:address',
      //   element: <UpdateWalletMetaPage />,
      // },
      // {
      //   path: 'settings/sap/seed-phrase',
      //   element: <SeedPhrasePage />,
      // },
      // {
      //   path: 'settings/sap/private-key',
      //   element: <ExportPrivateKeyPage />,
      // },
      // {
      //   path: 'settings/sap/change-password',
      //   element: <ChangePasswordPage />,
      // },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: 'welcome',
    element: <WelcomePage />,
  },
  {
    path: 'locked',
    element: <LockedPage />,
  },
  {
    path: '/initialize/*',
    element: <InitializePage />,
    children: [
      {
        index: true,
        element: <CreatePage />,
      },
      {
        path: 'create',
        element: <CreatePage />,
      },
      {
        path: 'backup',
        element: <BackupPage />,
      },
      {
        path: 'done',
        element: <DonePage />,
      },
      {
        path: 'import',
        element: <ImportPage />,
      },
    ],
  },
  {
    path: '/dapp/*',
    element: <ProtectedRouter />,
    children: [
      {
        path: 'connect/:requestID',
        element: <ConnectPage />,
      },
      // {
      //   path: 'tx-approval/:txID',
      //   element: <TxApprovalPage />,
      // },
    ],
  },
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App
