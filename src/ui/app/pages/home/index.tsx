import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { of, filter, switchMap, from, defer, repeat } from 'rxjs'

import { Loading } from '_components/loading'

import { useAppDispatch, useInitializedGuard, useLockedGuard } from '_hooks'

import { fetchAllOwnedAndRequiredObjects } from '_redux/slices/sui-objects'

const POLL_SUI_OBJECTS_INTERVAL = 4000

export const Home = () => {
  const dispatch = useAppDispatch()
  const initChecking = useInitializedGuard(true)
  const lockedChecking = useLockedGuard(false)

  const [visibility, setVisibility] = useState(
    document?.visibilityState || null
  )

  const guardChecking = initChecking || lockedChecking

  useEffect(() => {
    const callback = () => {
      setVisibility(document.visibilityState)
    }
    callback()

    document.addEventListener('visibilitychange', callback)

    return () => {
      document.removeEventListener('visibilitychange', callback)
    }
  }, [])

  useEffect(() => {
    const sub = of(guardChecking || visibility === 'hidden')
      .pipe(
        filter((paused) => !paused),
        switchMap(() =>
          defer(() => from(dispatch(fetchAllOwnedAndRequiredObjects()))).pipe(
            repeat({ delay: POLL_SUI_OBJECTS_INTERVAL })
          )
        )
      )
      .subscribe()
    return () => sub.unsubscribe()
  }, [guardChecking, visibility, dispatch])

  return (
    <Loading loading={guardChecking}>
      <Outlet />
    </Loading>
  )
}
