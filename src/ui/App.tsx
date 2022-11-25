import { createHashRouter, RouterProvider } from 'react-router-dom'

import { Home } from '_app/pages/home'
import { Welcome } from '_app/pages/welcome'
import { Locked } from '_app/pages/locked'
import { Initialize } from '_app/pages/initialize'
import { Create } from '_app/pages/initialize/create'

const router = createHashRouter([
  {
    path: '/*',
    element: <Home />,
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
    ],
  },
])

const App = () => {
  // const dispatch = useAppDispatch()
  // const location = useLocation()

  // useEffect(() => {

  // }, [location, dispatch])

  return <RouterProvider router={router} />
}

export default App
