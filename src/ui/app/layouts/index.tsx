import { memo } from 'react'
import cl from 'classnames'

import { Loading } from '_components/loading'

import { useAppSelector, useFullscreenGuard } from '_hooks'

import { getNavIsVisible, getHeaderVisible } from '_redux/slices/app'

import type { ReactNode } from 'react'

type PageLayoutProps = {
  forceFullscreen?: boolean
  children: ReactNode | ReactNode[]
  className?: string
}

const LayoutBase = ({
  forceFullscreen = false,
  children,
  className,
}: PageLayoutProps) => {
  const isHeaderVisible = useAppSelector(getHeaderVisible)
  const isNavVisible = useAppSelector(getNavIsVisible)
  const guardLoading = useFullscreenGuard(forceFullscreen)

  return (
    <Loading loading={guardLoading}>
      <div className="flex flex-col grow">
        {isHeaderVisible && <header>header</header>}
        <main className={cl(['flex flex-col grow', className])}>
          {children}
        </main>
        {isNavVisible && <nav>nav</nav>}
      </div>
    </Loading>
  )
}

export const Layout = memo(LayoutBase)
