// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Coin as CoinAPI, SUI_TYPE_ARG } from '@mysten/sui.js'

import type {
  ObjectId,
  SuiObject,
  SuiAddress,
  SuiMoveObject,
  JsonRpcProvider,
  SuiExecuteTransactionResponse,
  SignerWithProvider,
} from '@mysten/sui.js'

const COIN_TYPE = '0x2::coin::Coin'
const COIN_TYPE_ARG_REGEX = /^0x2::coin::Coin<(.+)>$/

export const DEFAULT_GAS_BUDGET_FOR_PAY = 150
export const DEFAULT_GAS_BUDGET_FOR_STAKE = 15000
export const GAS_TYPE_ARG = '0x2::sui::SUI'
export const GAS_SYMBOL = 'SUI'
export const DEFAULT_NFT_TRANSFER_GAS_FEE = 450
export const SUI_SYSTEM_STATE_OBJECT_ID =
  '0x0000000000000000000000000000000000000005'

// TODO use sdk
export class Coin {
  public static isCoin(obj: SuiObject) {
    return (
      obj.data.dataType === 'moveObject' && obj.data.type.startsWith(COIN_TYPE)
    )
  }

  public static getCoinTypeArg(obj: SuiMoveObject) {
    const res = obj.type.match(COIN_TYPE_ARG_REGEX)
    return res ? res[1] : null
  }

  public static isSUI(obj: SuiMoveObject) {
    const arg = Coin.getCoinTypeArg(obj)
    return arg ? Coin.getCoinSymbol(arg) === 'SUI' : false
  }

  public static getCoinSymbol(coinTypeArg: string) {
    return coinTypeArg.substring(coinTypeArg.lastIndexOf(':') + 1)
  }

  public static getBalance(obj: SuiMoveObject): bigint {
    return BigInt(obj.fields.balance)
  }

  public static getID(obj: SuiMoveObject): ObjectId {
    return obj.fields.id.id
  }

  public static getCoinTypeFromArg(coinTypeArg: string) {
    return `${COIN_TYPE}<${coinTypeArg}>`
  }

  public static computeGasBudgetForPay(
    coins: SuiMoveObject[],
    amountToSend: bigint
  ): number {
    // TODO: improve the gas budget estimation
    const numInputCoins =
      CoinAPI.selectCoinSetWithCombinedBalanceGreaterThanOrEqual(
        coins,
        amountToSend
      ).length
    return (
      DEFAULT_GAS_BUDGET_FOR_PAY * Math.max(2, Math.min(100, numInputCoins / 2))
    )
  }

  /**
   * Stake `amount` of Coin<T> to `validator`. Technically it means user delegates `amount` of Coin<T> to `validator`,
   * such that `validator` will stake the `amount` of Coin<T> for the user.
   *
   * @param signer A signer with connection to fullnode
   * @param coins A list of Coins owned by the signer with the same generic type(e.g., 0x2::Sui::Sui)
   * @param gasCoins A list of Sui coins owned by the signer
   * @param amount The amount to be staked
   * @param validator The sui address of the chosen validator
   */
  public static async stakeCoin(
    signer: SignerWithProvider,
    coins: SuiMoveObject[],
    gasCoins: SuiMoveObject[],
    amount: bigint,
    validator: SuiAddress
  ): Promise<SuiExecuteTransactionResponse> {
    // sort to get the smallest one for gas
    const sortedGasCoins = CoinAPI.sortByBalance(gasCoins)
    const gasCoin = CoinAPI.selectCoinWithBalanceGreaterThanOrEqual(
      sortedGasCoins,
      BigInt(DEFAULT_GAS_BUDGET_FOR_STAKE)
    )
    if (!gasCoin) {
      throw new Error(
        'Insufficient funds, not enough funds to cover for gas fee.'
      )
    }
    if (!coins.length) {
      throw new Error('Insufficient funds, no coins found.')
    }
    const isSui = CoinAPI.getCoinTypeArg(coins[0]) === SUI_TYPE_ARG
    const stakeCoins =
      CoinAPI.selectCoinSetWithCombinedBalanceGreaterThanOrEqual(
        coins,
        amount,
        isSui ? [CoinAPI.getID(gasCoin)] : undefined
      ).map(CoinAPI.getID)
    if (!stakeCoins.length) {
      if (stakeCoins.length === 1 && isSui) {
        throw new Error(
          'Not enough coin objects, at least 2 coin objects are required.'
        )
      } else {
        throw new Error('Insufficient funds, try reducing the stake amount.')
      }
    }
    const txn = {
      packageObjectId: '0x2',
      module: 'sui_system',
      function: 'request_add_delegation_mul_coin',
      typeArguments: [],
      arguments: [
        SUI_SYSTEM_STATE_OBJECT_ID,
        stakeCoins,
        [String(amount)],
        validator,
      ],
      gasBudget: DEFAULT_GAS_BUDGET_FOR_STAKE,
    }
    return await signer.executeMoveCall(txn)
  }

  public static async unStakeCoin(
    signer: SignerWithProvider,
    delegation: ObjectId,
    stakedSuiId: ObjectId
  ): Promise<SuiExecuteTransactionResponse> {
    const txn = {
      packageObjectId: '0x2',
      module: 'sui_system',
      function: 'request_withdraw_delegation',
      typeArguments: [],
      arguments: [SUI_SYSTEM_STATE_OBJECT_ID, delegation, stakedSuiId],
      gasBudget: DEFAULT_GAS_BUDGET_FOR_STAKE,
    }
    return signer.executeMoveCall(txn)
  }

  private static async requestSuiCoinWithExactAmount(
    signer: SignerWithProvider,
    coins: SuiMoveObject[],
    amount: bigint
  ): Promise<ObjectId> {
    const coinWithExactAmount = await Coin.selectSuiCoinWithExactAmount(
      signer,
      coins,
      amount
    )
    if (coinWithExactAmount) {
      return coinWithExactAmount
    }
    // use transferSui API to get a coin with the exact amount
    await signer.signAndExecuteTransaction(
      await CoinAPI.newPayTransaction(
        coins,
        SUI_TYPE_ARG,
        amount,
        await signer.getAddress(),
        Coin.computeGasBudgetForPay(coins, amount)
      )
    )

    const coinWithExactAmount2 = await Coin.selectSuiCoinWithExactAmount(
      signer,
      coins,
      amount,
      true
    )
    if (!coinWithExactAmount2) {
      throw new Error(`requestCoinWithExactAmount failed unexpectedly`)
    }
    return coinWithExactAmount2
  }

  private static async selectSuiCoinWithExactAmount(
    signer: SignerWithProvider,
    coins: SuiMoveObject[],
    amount: bigint,
    refreshData = false
  ): Promise<ObjectId | undefined> {
    const coinsWithSufficientAmount = refreshData
      ? await signer.provider.selectCoinsWithBalanceGreaterThanOrEqual(
          await signer.getAddress(),
          amount,
          SUI_TYPE_ARG,
          []
        )
      : await CoinAPI.selectCoinsWithBalanceGreaterThanOrEqual(coins, amount)

    if (
      coinsWithSufficientAmount.length > 0 &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      CoinAPI.getBalance(coinsWithSufficientAmount[0])! === amount
    ) {
      return CoinAPI.getID(coinsWithSufficientAmount[0])
    }

    return undefined
  }

  public static async getActiveValidators(
    provider: JsonRpcProvider
  ): Promise<Array<SuiMoveObject>> {
    const contents = await provider.getObject(SUI_SYSTEM_STATE_OBJECT_ID)
    const data = (contents.details as SuiObject).data
    const validators = (data as SuiMoveObject).fields.validators
    const active_validators = (validators as SuiMoveObject).fields
      .active_validators
    return active_validators as Array<SuiMoveObject>
  }
}
