import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'

import { Welcome } from '_app/pages/welcome'

import { Home } from '_app/pages/home'
import { Landing } from '_app/pages/home/landing'
import { Detail } from '_app/pages/home/landing/defail'
import { Nft } from '_src/ui/app/pages/home/nft'
import { History } from '_src/ui/app/pages/home/history'
import { Settings } from '_src/ui/app/pages/home/settings'
import { Sap } from '_src/ui/app/pages/home/settings/sap'

import { Initialize } from '_app/pages/initialize'
import { Create } from '_app/pages/initialize/create'
import { Backup } from '_app/pages/initialize/backup'
import { Done } from '_app/pages/initialize/done'

import { Locked } from '_app/pages/locked'

const router = createHashRouter([
  {
    path: '/*',
    element: <Home />,
    children: [
      {
        path: 'landing/',
        element: <Landing />,
      },
      {
        path: 'landing/:coin',
        element: <Detail />,
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
        element: <Navigate to="/landing" replace={true} />,
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
    ],
  },
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App
