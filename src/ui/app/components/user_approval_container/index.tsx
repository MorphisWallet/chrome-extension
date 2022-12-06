import { useMemo, useState } from 'react'
import cl from 'classnames'

import { Loading, Button, Address } from '_app/components'

type UserApproveContainerProps = {
  children: React.ReactNode | React.ReactNode[]
  origin: string
  originFavIcon?: string
  requestType?: string
  rejectTitle: string
  approveTitle: string
  onSubmit: (approved: boolean) => void
  isConnect?: boolean
  isWarning?: boolean
}

export const UserApproveContainer = ({
  origin,
  originFavIcon,
  children,
  requestType,
  rejectTitle,
  approveTitle,
  onSubmit,
  isConnect,
  isWarning,
}: UserApproveContainerProps) => {
  const [submitting, setSubmitting] = useState(false)

  const handleOnResponse = async ({ allowed }: { allowed: boolean }) => {
    setSubmitting(true)
    await onSubmit(allowed)
    setSubmitting(false)
  }

  const parsedOrigin = useMemo(() => new URL(origin), [origin])

  return (
    <div className="flex flex-col grow p-6 font-medium overflow-hidden">
      <div className="flex flex-col items-center shrink-0 mx-2 pb-6 text-sm border-b border-b-[#c4c4c4]">
        <p className="text-lg mb-5">{requestType}</p>
        {originFavIcon ? (
          <img
            src={originFavIcon}
            alt="Site favicon"
            className="h-[69px] w-[69px] mb-5"
          />
        ) : null}
        <p className="mb-1">{parsedOrigin?.host?.split('.')?.[0]}</p>
        <a
          href={origin}
          target="_blank"
          rel="noreferrer"
          className={cl('text-[#4aaafb] mb-1', isWarning && '!text-[#d74b4a]')}
        >
          {origin}
        </a>
        {isWarning && (
          <p className="text-center text-[#d74b4a] mb-1">
            This site is not secure. Your wallet information might be stolen.
            Connect at your own risk!
          </p>
        )}
        <Address addressOnly />
      </div>
      <div className="flex grow overflow-y-auto">{children}</div>
      <div className="flex gap-3 shrink-0">
        <Button
          type="button"
          variant="outlined"
          data-allow="false"
          onClick={() => handleOnResponse({ allowed: false })}
          className={cl(
            '',
            isWarning ? '' : isConnect ? '' : 'border-[#b74d4a]'
          )}
          disabled={submitting}
        >
          {rejectTitle}
        </Button>
        <Button
          type="button"
          variant="contained"
          className={cl('', isWarning ? 'text-[#d74b4a]' : '', submitting && '')}
          data-allow="true"
          onClick={() => handleOnResponse({ allowed: true })}
          loading={submitting}
        >
          <Loading loading={submitting}>
            <span>{approveTitle}</span>
          </Loading>
        </Button>
      </div>
    </div>
  )
}
