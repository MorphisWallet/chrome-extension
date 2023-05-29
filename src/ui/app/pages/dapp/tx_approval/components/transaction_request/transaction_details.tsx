// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import cl from 'classnames'
import { Tab, Disclosure } from '@headlessui/react'
import {
  is,
  toB64,
  formatAddress,
  normalizeSuiAddress,
  BuilderCallArg,
  TypeTagSerializer,
  type TransactionType,
  type TransactionArgument,
  type MakeMoveVecTransaction,
  type PublishTransaction,
  type SuiAddress,
  type TransactionBlock,
  type TypeTag,
} from '@mysten/sui.js'

import { Loading, TxLink } from '_src/ui/app/components'

import { useTransactionData } from '_src/ui/app/hooks'

import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'

import ChevronRight from '_assets/icons/chevron_right.svg'

function convertCommandArgumentToString(
  arg:
    | string
    | number
    | string[]
    | number[]
    | TransactionArgument
    | TransactionArgument[]
    | MakeMoveVecTransaction['type']
    | PublishTransaction['modules']
): string | null {
  if (!arg) return null

  if (typeof arg === 'string' || typeof arg === 'number') return String(arg)

  if (typeof arg === 'object' && 'None' in arg) {
    return null
  }

  if (typeof arg === 'object' && 'Some' in arg) {
    if (typeof arg.Some === 'object') {
      // MakeMoveVecTransaction['type'] is TypeTag type
      return TypeTagSerializer.tagToString(arg.Some as TypeTag)
    }
    return arg.Some
  }

  if (Array.isArray(arg)) {
    // Publish transaction special casing:
    if (typeof arg[0] === 'number') {
      return toB64(new Uint8Array(arg as number[]))
    }

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
      // eslint-disable-next-line no-console
      console.warn('Unexpected command argument type.', arg)
      return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

      const stringValue = convertCommandArgumentToString(value)

      if (!stringValue) return null

      return `${key}: ${stringValue}`
    })
    .filter(Boolean)
    .join(', ')
}

interface Props {
  sender?: SuiAddress
  transaction: TransactionBlock
}

export const TransactionDetails = ({ sender, transaction }: Props) => {
  const { data: transactionData } = useTransactionData(sender, transaction)

  return (
    <div>
      <Loading loading={!transactionData}>
        {transactionData && (
          <div>
            <Tab.Group>
              <Tab.List className="flex gap-2 mb-2">
                {!!transactionData.transactions.length && (
                  <Tab>
                    {({ selected }) => (
                      <span
                        className={cl([
                          'border-b border-gray-500',
                          selected && 'text-black !border-black',
                        ])}
                      >
                        Transactions
                      </span>
                    )}
                  </Tab>
                )}
                {!!transactionData.inputs.length && (
                  <Tab>
                    {({ selected }) => (
                      <span
                        className={cl([
                          'border-b border-gray-500',
                          selected && 'text-black !border-black',
                        ])}
                      >
                        Inputs
                      </span>
                    )}
                  </Tab>
                )}
              </Tab.List>
              <Tab.Panels>
                {!!transactionData.transactions.length && (
                  <Tab.Panel className="flex flex-col gap-2">
                    {transactionData.transactions.map((_transaction, index) => (
                      <div key={`${_transaction.kind}_${index}`}>
                        <Disclosure>
                          {({ open }) => (
                            <>
                              <Disclosure.Button className="flex w-full justify-between text-left text-sm font-medium rounded-lg">
                                <p className="grow flex justify-between items-center text-black">
                                  <span>{_transaction.kind}</span>
                                  <ChevronRight
                                    className={cl([
                                      open ? '-rotate-90' : 'rotate-90',
                                    ])}
                                    height={12}
                                    width={12}
                                  />
                                </p>
                              </Disclosure.Button>
                              <Disclosure.Panel className="pb-2 text-sm text-gray-500 break-words">
                                {convertCommandToString(_transaction)}
                              </Disclosure.Panel>
                            </>
                          )}
                        </Disclosure>
                      </div>
                    ))}
                  </Tab.Panel>
                )}
                {!!transactionData.inputs.length && (
                  <Tab.Panel className="flex flex-col gap-2">
                    {transactionData.inputs.map((_input, index) => {
                      const objectId =
                        _input.value?.Object?.ImmOrOwned?.objectId ||
                        _input.value?.Object?.Shared?.objectId

                      return (
                        <div key={`${_input.index}_${index}`}>
                          {is(_input.value, BuilderCallArg) ? (
                            'Pure' in _input.value ? (
                              `${toB64(new Uint8Array(_input.value.Pure))}`
                            ) : (
                              <TxLink
                                className="text-hero-dark no-underline"
                                type={ExplorerLinkType.object}
                                objectID={objectId}
                              >
                                {formatAddress(objectId)}
                              </TxLink>
                            )
                          ) : (
                            'Unknown input value'
                          )}
                        </div>
                      )
                    })}
                  </Tab.Panel>
                )}
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </Loading>
    </div>
  )
}
