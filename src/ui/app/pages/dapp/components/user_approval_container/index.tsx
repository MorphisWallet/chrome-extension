// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react'
import { formatAddress } from '@mysten/sui.js'

import { Button } from '_app/components'

import type { ReactNode } from 'react'
import type { SuiAddress } from '@mysten/sui.js'

type UserApproveContainerProps = {
  children: ReactNode | ReactNode[]
  origin: string
  originFavIcon?: string
  rejectTitle?: string
  approveTitle?: string
  approveDisabled?: boolean
  onSubmit: (approved: boolean) => Promise<void> | void
  isWarning?: boolean
  address?: SuiAddress
  title: string
  // addressHidden?: boolean
  // scrollable?: boolean
}

export function UserApproveContainer({
  origin,
  originFavIcon,
  children,
  title,
  rejectTitle = 'Reject',
  approveTitle = 'Approve',
  approveDisabled = false,
  onSubmit,
  isWarning,
  address,
}: UserApproveContainerProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleOnResponse = useCallback(
    async (allowed: boolean) => {
      setSubmitting(true)
      await onSubmit(allowed)
      setSubmitting(false)
    },
    [onSubmit]
  )

  const parsedOrigin = useMemo(() => new URL(origin), [origin])

  return (
    <div className="flex flex-col grow px-8 py-4 overflow-y-auto">
      <div className="">
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-xl">{title}</p>
          <img
            className="w-18 h-18 shrink-0 object-contain"
            src={originFavIcon}
            alt={parsedOrigin.host}
          />
          <a
            className="text-[#6bb7e9]"
            href={origin}
            target="_blank"
            rel="noreferrer"
          >
            {origin}
          </a>
          {address && (
            <p className="text-slate-500">{formatAddress(address || '')}</p>
          )}
        </div>
        <div>{children}</div>
      </div>
      <div className="flex flex-col grow justify-end">
        <div className="flex gap-4">
          <Button
            disabled={submitting}
            onClick={() => {
              handleOnResponse(false)
            }}
            variant="outlined"
          >
            {rejectTitle}
          </Button>
          <Button
            // recreate the button when changing the variant to avoid animating to the new styles
            key={`approve_${isWarning}`}
            onClick={() => {
              handleOnResponse(true)
            }}
            disabled={approveDisabled}
            loading={submitting}
            variant="contained"
          >
            {approveTitle}
          </Button>
        </div>
      </div>
    </div>
  )
}
