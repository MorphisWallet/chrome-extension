export enum StakeState {
  WARM_UP = 'WARM_UP',
  EARNING = 'EARNING',
  COOL_DOWN = 'COOL_DOWN',
  WITHDRAW = 'WITHDRAW',
  IN_ACTIVE = 'IN_ACTIVE',
}

export const STATUS_TEXT = {
  [StakeState.WARM_UP]: 'Starts Earning',
  [StakeState.EARNING]: 'Staking Rewards',
  [StakeState.COOL_DOWN]: 'Available to withdraw',
  [StakeState.WITHDRAW]: 'Withdraw',
  [StakeState.IN_ACTIVE]: 'Inactive',
}
