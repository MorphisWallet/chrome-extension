import { accountsMetaSelector } from '../redux/slices/account'
import useAppSelector from './useAppSelector'

export function useAccountsMeta() {
  return useAppSelector(accountsMetaSelector)
}
