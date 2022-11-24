import { createHashRouter, RouterProvider } from 'react-router-dom'

import { Home } from '_app/pages/home'
import { Welcome } from '_app/pages/welcome'

const router = createHashRouter([
  {
    path: '/*',
    element: <Home />,
  },
  {
    path: 'welcome',
    element: <Welcome />,
  },
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App
