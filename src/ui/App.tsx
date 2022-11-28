import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'

import { Home } from '_app/pages/home'
import { Landing } from '_app/pages/home/landing'
import { Welcome } from '_app/pages/welcome'
import { Locked } from '_app/pages/locked'
import { Initialize } from '_app/pages/initialize'
import { Create } from '_app/pages/initialize/create'
import { Backup } from '_app/pages/initialize/backup'
import { Done } from '_app/pages/initialize/done'
import { Nft } from '_app/pages/nft'
import { History } from '_app/pages/history'

const router = createHashRouter([
  {
    path: '/*',
    element: <Home />,
    children: [
      {
        path: 'landing/*',
        element: <Landing />,
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
  {
    path: '/nft',
    element: <Nft />,
  },
  {
    path: '/history',
    element: <History />,
  },
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App
