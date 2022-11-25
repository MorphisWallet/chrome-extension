import cl from 'classnames'

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode
  error?: boolean
}

export const Checkbox = ({
  className,
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
      className="h-4 w-4 mr-2 cursor-pointer accent-black"
      type="checkbox"
      {...rest}
    />
    <label htmlFor={name}>{label}</label>
  </div>
)
