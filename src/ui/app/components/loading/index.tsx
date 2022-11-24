import { memo } from 'react'
import cl from 'classnames'

import { Spinner } from '../spinner'

import type { ReactNode } from 'react'

type LoadingProps = {
  loading: boolean
  children: ReactNode | ReactNode[]
  className?: string
}

// full screen loading indicator
// for component-level loading, use spinner
const LoadingBase = ({ loading, children, className }: LoadingProps) => {
  if (loading)
    return (
      <div
        className={cl([
          'flex grow justify-center items-center h-full w-full',
          className,
        ])}
      >
        <Spinner />
      </div>
    )

  return <>{children}</>
}

export const Loading = memo(LoadingBase)
