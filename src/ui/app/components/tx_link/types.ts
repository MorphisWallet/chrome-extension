import type { ObjectId, SuiAddress, TransactionDigest } from '@mysten/sui.js'

export enum ExplorerLinkType {
  address,
  object,
  transaction,
}

export type TxObjectTypes = {
  type:
    | ExplorerLinkType.address
    | ExplorerLinkType.object
    | ExplorerLinkType.transaction
  address?: SuiAddress
  useActiveAddress?: boolean
  objectID?: ObjectId
  transactionID?: TransactionDigest
}
