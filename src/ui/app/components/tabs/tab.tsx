import { useContext } from 'react'
import cl from 'classnames'

import { TabsContext } from './tab_context'

type TabProps = {
  value: string | number
  label: React.ReactNode | React.ReactNode[]
  classNames?: string
}

export const Tab = ({ value, label, classNames }: TabProps) => {
  const { onChange } = useContext(TabsContext)

  const onClick = () => {
    onChange(value)
  }

  return (
    <div
      onClick={onClick}
      className={cl([
        'flex items-center h-9 leading-9 px-4 cursor-pointer',
        'transition hover:scale-105',
        classNames,
      ])}
      data-value={value}
    >
      {label}
    </div>
  )
}
