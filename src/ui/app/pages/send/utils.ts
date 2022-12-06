import BigNumber from 'bignumber.js'

export type ConfirmFields = {
  amount: string
  address: string
}

export const parseAmount = (amount: string): BigNumber => {
  try {
    return BigNumber(amount)
  } catch (e) {
    return BigNumber(0)
  }
}
