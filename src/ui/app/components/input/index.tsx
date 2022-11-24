import cl from 'classnames'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  inputClassName?: string
}

export const Input = ({
  className,
  inputClassName,
  error,
  ...rest
}: InputProps) => (
  <div className={className}>
    <input
      className={cl([
        'h-[42px] w-full border border-[#7e7e7e] rounded-[50px] focus:border-2 px-6 text-sm placeholder:text-[#c8c8c8]',
        error ? 'border-[#D74B4A]' : '',
        inputClassName,
      ])}
      {...rest}
    />
    {error && <p className="text-[#D74B4A] text-center">{error}</p>}
  </div>
)
