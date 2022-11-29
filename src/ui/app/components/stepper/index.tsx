import cl from 'classnames'

import { IconWrapper } from '_components/icon_wrapper'

import BackArrow from '_assets/icons/arrow_short.svg'

type StepperProps = {
  steps: number
  current: number
  onPrev?: () => void
}

export const Stepper = ({ steps, current, onPrev }: StepperProps) => (
  <div className="flex flex-row justify-center items-center h-[50px] w-full relative gap-x-2">
    {onPrev && (
      <IconWrapper onClick={onPrev} className="absolute left-0">
        <BackArrow />
      </IconWrapper>
    )}
    {Array(steps)
      .fill(undefined)
      .map((_, i) => (
        <div
          key={i}
          className={cl([
            'h-[5px] w-[5px] bg-[#d9d9d9] rounded',
            current === i && 'bg-[#000]',
          ])}
        />
      ))}
  </div>
)
