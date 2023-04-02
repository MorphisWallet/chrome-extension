import { Outlet } from 'react-router-dom'

import { Loading } from '_components/loading'

import { useInitializedGuard, useLockedGuard } from '_hooks'

const ProtectedRouter = () => {
  const initChecking = useInitializedGuard(true)
  const lockedChecking = useLockedGuard(false)

  const guardChecking = initChecking || lockedChecking

  return (
    <Loading loading={guardChecking}>
      <Outlet />
    </Loading>
  )
}

export default ProtectedRouter
