import cl from 'classnames'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = ({ className, ...rest }: InputProps) => (
  <input
    className={cl([
      'h-[42px] w-full border border-[#7e7e7e] rounded-[50px] focus:border-2 px-6 text-sm placeholder:text-[#c8c8c8]',
      className,
    ])}
    {...rest}
  />
)
