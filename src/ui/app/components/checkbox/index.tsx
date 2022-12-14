import cl from 'classnames'

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode
  error?: boolean
  inputClassName?: string
}

export const Checkbox = ({
  className,
  inputClassName,
  name,
  label,
  error,
  ...rest
}: CheckboxProps) => (
  <div
    className={cl([
      'flex items-center text-sm',
      error ? 'animate-shake text-[#D74B4A]' : '',
      className,
    ])}
  >
    <input
      className={cl([
        'h-4 w-4 mr-2 cursor-pointer accent-black',
        inputClassName,
      ])}
      type="checkbox"
      {...rest}
    />
    <label htmlFor={name}>{label}</label>
  </div>
)
