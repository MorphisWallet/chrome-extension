import SpinnerIcon from '_assets/icons/spinner.svg'

type SpinnerProps = React.SVGProps<SVGElement> & {
  size?: number
}

const BASE_SIZE = 16

export const Spinner = ({ size = BASE_SIZE, ...rest }: SpinnerProps) => (
  <SpinnerIcon height={size} width={size} {...rest} />
)
