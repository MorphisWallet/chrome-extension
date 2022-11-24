// import { useEffect } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'

import { Home } from '_app/pages/home'
import { Welcome } from '_app/pages/welcome'

// import { useAppDispatch } from '_hooks'

// import { setNavVisibility, setHeaderVisibility } from '_redux/slices/app'

// const HIDDEN_NAV_PATHS = []

// const HIDDEN_HEADER_PATHS = []

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
  // const dispatch = useAppDispatch()
  // const location = useLocation()

  // useEffect(() => {

  // }, [location, dispatch])

  return <RouterProvider router={router} />
}

export default App
