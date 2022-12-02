import { isValidSuiAddress } from '@mysten/sui.js'
import * as Yup from 'yup'

export const passwordValidation = Yup.string()
  .ensure()
  .min(6, 'Password needs to be at least 6 characters')
  .required('Password is required')

export const getConfirmPasswordValidation = (passwordFieldName: string) =>
  Yup.string()
    .ensure()
    .required('Confirmed Password is required')
    .oneOf([Yup.ref(passwordFieldName)], 'Passwords must match')

export const suiAddressValidation = Yup.string()
  .ensure()
  .trim()
  .required()
  .transform((value: string) =>
    value.startsWith('0x') || value === '' || value === '0'
      ? value
      : `0x${value}`
  )
  .test('is-sui-address', 'Invalid address. Please check again.', (value) =>
    isValidSuiAddress(value)
  )
