import { memo } from 'react'
import cl from 'classnames'

import type { ReactNode } from 'react'

type PageLayoutProps = {
  children: ReactNode | ReactNode[]
  className?: string
  showHeader?: boolean
  showNav?: boolean
}

const LayoutBase = ({
  children,
  className,
  showHeader = true,
  showNav = true,
}: PageLayoutProps) => {
  return (
    <div className="flex flex-col grow">
      {showHeader && <header>header</header>}
      <main className={cl(['flex flex-col grow', className])}>{children}</main>
      {showNav && <nav>nav</nav>}
    </div>
  )
}

export const Layout = memo(LayoutBase)
