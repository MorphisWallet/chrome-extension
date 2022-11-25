import React from 'react'
import cl from 'classnames'

type IconProps = React.DOMAttributes<HTMLDivElement> & {
  className?: string
}

/* wrapper component to append effects to svg icons */
export const IconWrapper = ({ className, children, ...rest }: IconProps) => (
  <div
    className={cl([
      'flex justify-center items-center h-4 cursor-pointer',
      'transition-all duration-100 ease-in-out text-[#000000]',
      'hover:scale-110 active:scale-125 hover:text-[#2a2a2d] active:text-[#6a6a6d]',
      className,
    ])}
    {...rest}
  >
    {children}
  </div>
)
