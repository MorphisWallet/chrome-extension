import cl from 'classnames'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'contained' | 'outlined'
}

const VARIANT_STYLES = {
  contained:
    'bg-black text-white hover:bg-[#2a2a2d] disabled:bg-[#c4c4c4] active:bg-[#4a4a4a]',
  outlined:
    'bg-white text-black border border-black hover:bg-[#e3e3e4] disabled:text-[#c4c4c4] disabled:border-[#c4c4c4] disabled:bg-white disabled:hover:bg-white active:bg-[#d1d1d1]',
}

export const Button = ({
  children,
  className,
  variant = 'contained',
  ...rest
}: ButtonProps) => (
  <button
    className={cl([
      'w-full h-[42px] rounded-[20px] px-4 font-medium truncate transition duration-100 ease-linear disabled:cursor-not-allowed',
      VARIANT_STYLES[variant],
      className,
    ])}
    {...rest}
  >
    {children}
  </button>
)
