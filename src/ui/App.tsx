import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'

import { Welcome } from '_app/pages/welcome'

import { Home } from '_app/pages/home'
import { Landing } from '_app/pages/home/landing'
import { Detail } from '_app/pages/home/landing/detail'
import { Send } from '_app/pages/home/send'
import { Nft } from '_app/pages/home/nft'
import { History } from '_app/pages/home/history'
import { Settings } from '_app/pages/home/settings'
import { Sap } from '_app/pages/home/settings/sap'

import { Initialize } from '_app/pages/initialize'
import { Create } from '_app/pages/initialize/create'
import { Backup } from '_app/pages/initialize/backup'
import { Done } from '_app/pages/initialize/done'
import { ImportPage } from '_app/pages/initialize/import'

import { Locked } from '_app/pages/locked'

import NotFound from '_app/pages/not_found'

const router = createHashRouter([
  {
    path: '/*',
    element: <Home />,
    children: [
      {
        path: '',
        element: <Navigate to="/landing" replace={true} />,
      },
      {
        path: 'landing/',
        element: <Landing />,
      },
      {
        path: 'landing/:coin',
        element: <Detail />,
      },
      {
        path: 'send',
        element: <Send />,
      },
      {
        path: 'nft',
        element: <Nft />,
      },
      {
        path: 'history',
        element: <History />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'settings/sap',
        element: <Sap />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: 'welcome',
    element: <Welcome />,
  },
  {
    path: 'locked',
    element: <Locked />,
  },
  {
    path: '/initialize',
    element: <Initialize />,
    children: [
      {
        index: true,
        element: <Create />,
      },
      {
        path: 'create',
        element: <Create />,
      },
      {
        path: 'backup',
        element: <Backup />,
      },
      {
        path: 'done',
        element: <Done />,
      },
      {
        path: 'import',
        element: <ImportPage />,
      },
    ],
  },
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App
