import { useMemo } from 'react'
import cl from 'classnames'
import {
  formatAddress,
  type TransactionBlock,
  type SuiAddress,
} from '@mysten/sui.js'

import { TxLink, Loading } from '_src/ui/app/components'

import { useTransactionDryRun } from '_src/ui/app/hooks'
import { useFormatCoin, CoinFormat } from '_src/ui/core'

import { useTransactionSummary } from '_src/ui/core/hooks/useTransactionSummary'
import { BalanceChangeSummary } from '_src/ui/core/utils/transaction'
import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'

type TransactionSummaryProps = {
  transaction: TransactionBlock
  address: SuiAddress
}

export const TransactionSummary = ({
  transaction,
  address,
}: TransactionSummaryProps) => {
  const { data, isLoading: isDryRunLoading } = useTransactionDryRun(
    address,
    transaction
  )
  const summary = useTransactionSummary({
    transaction: data,
    currentAddress: address,
  })

  const balanceChanges = summary?.balanceChanges
  // const objectSummary = summary?.objectSummary

  return (
    <div className="flex flex-col mb-2">
      <p className="mb-2">TRANSACTION SUMMARY</p>
      <Loading loading={isDryRunLoading}>
        {balanceChanges && <BalanceChanges changes={balanceChanges} />}
      </Loading>
    </div>
  )
}

type BalanceChangesProps = {
  changes: BalanceChangeSummary[] | null
}

const BalanceChanges = ({ changes }: BalanceChangesProps) => {
  if (!changes?.length) return null

  const changesByOwner = useMemo(
    () =>
      changes.reduce((acc, change) => {
        const owner = change.owner ?? ''

        acc[owner] = acc[owner] ?? []
        acc[owner].push(change)

        return acc
      }, {} as Record<string, BalanceChangeSummary[]>),
    [changes]
  )

  return (
    <>
      {Object.entries(changesByOwner).map(([owner, changes], index) => (
        <div className="flex flex-col" key={index}>
          <div>
            <TxLink type={ExplorerLinkType.address} address={owner}>
              <span className="truncate">{formatAddress(owner)}</span>
            </TxLink>
          </div>
          <div className="flex flex-col">
            {changes?.map((_change, index) => (
              <BalanceChange change={_change} key={index} />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

type BalanceChangeProps = {
  change: BalanceChangeSummary
}

const BalanceChange = ({ change }: BalanceChangeProps) => {
  const { amount, coinType } = change
  const isPositive = BigInt(amount) > 0n

  const [formatted, symbol] = useFormatCoin(amount, coinType, CoinFormat.FULL)

  return (
    <span className={cl(isPositive ? 'text-green-500' : 'text-red-500')}>
      {`${isPositive ? '+' : ''}${formatted} ${symbol}`}
    </span>
  )
}
