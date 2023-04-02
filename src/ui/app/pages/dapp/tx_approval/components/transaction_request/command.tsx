// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react'
import {
  type TransactionArgument,
  formatAddress,
  type TransactionType,
  normalizeSuiAddress,
} from '@mysten/sui.js'
import cl from 'classnames'

import ChevronRight from '_assets/icons/chevron_right.svg'

function convertCommandArgumentToString(
  arg: string | string[] | TransactionArgument | TransactionArgument[]
): string {
  if (typeof arg === 'string') return arg

  if (Array.isArray(arg)) {
    return `[${arg
      .map((argVal) => convertCommandArgumentToString(argVal))
      .join(', ')}]`
  }

  switch (arg.kind) {
    case 'GasCoin':
      return 'GasCoin'
    case 'Input':
      return `Input(${arg.index})`
    case 'Result':
      return `Result(${arg.index})`
    case 'NestedResult':
      return `NestedResult(${arg.index}, ${arg.resultIndex})`
    default:
      throw new Error('Unexpected argument kind')
  }
}

function convertCommandToString({ kind, ...command }: TransactionType) {
  const commandArguments = Object.entries(command)

  return commandArguments
    .map(([key, value]) => {
      if (key === 'target') {
        const [packageId, moduleName, functionName] = value.split('::')
        return [
          `package: ${formatAddress(normalizeSuiAddress(packageId))}`,
          `module: ${moduleName}`,
          `function: ${functionName}`,
        ].join(', ')
      }

      return `${key}: ${convertCommandArgumentToString(value)}`
    })
    .join(', ')
}

interface CommandProps {
  command: TransactionType
}

export function Command({ command }: CommandProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button onClick={() => setExpanded((expanded) => !expanded)} className="">
        <p>{command.kind}</p>
        <ChevronRight
          className={cl([expanded ? '-rotate-90' : 'rotate-90'])}
          height={12}
          width={12}
        />
      </button>
      {expanded && (
        <div className="mt-2 text-p2 font-medium text-steel">
          ({convertCommandToString(command)})
        </div>
      )}
    </div>
  )
}
