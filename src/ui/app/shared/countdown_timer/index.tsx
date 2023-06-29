// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useTimeAgo, TimeUnit } from '_src/ui/core'

type CountDownTimerProps = {
  timestamp: number | undefined
  label?: string
  endLabel?: string
  className?: string
}

export function CountDownTimer({
  timestamp,
  label,
  endLabel = 'now',
  className,
}: CountDownTimerProps) {
  const timeAgo = useTimeAgo({
    timeFrom: timestamp || null,
    shortedTimeLabel: false,
    shouldEnd: true,
    endLabel: endLabel,
    maxTimeUnit: TimeUnit.ONE_HOUR,
  })

  return (
    <span className={className}>
      {timeAgo === endLabel ? '' : label} {timeAgo}
    </span>
  )
}
