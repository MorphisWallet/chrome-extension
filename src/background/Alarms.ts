import Browser from 'webextension-polyfill'

import {
  AUTO_LOCK_TIMER_DEFAULT_INTERVAL_MINUTES,
  AUTO_LOCK_TIMER_STORAGE_KEY,
} from '_src/shared/constants'
import { get } from '_shared/storage'

export const LOCK_ALARM_NAME = 'lock-keyring-alarm'

// set wallet auto-lock alarm time, default AUTO_LOCK_TIMER_DEFAULT_INTERVAL_MINUTES = 5 minutes
export const setLockAlarm = async () => {
  const delayInMinutes = await get<number>(AUTO_LOCK_TIMER_STORAGE_KEY)

  Browser.alarms.create(LOCK_ALARM_NAME, {
    delayInMinutes: delayInMinutes || AUTO_LOCK_TIMER_DEFAULT_INTERVAL_MINUTES,
  })
}

// clear auto-lock alarm
export const clearLockAlarm = async () =>
  await Browser.alarms.clear(LOCK_ALARM_NAME)
