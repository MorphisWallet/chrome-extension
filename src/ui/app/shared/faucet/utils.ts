// import type { IntlShape } from 'react-intl'

type FaucetError = {
  // intl: IntlShape,
  status: number
  statusTxt: string | undefined
  retryAfter: number | undefined
}

export const formatFaucetError = ({
  status,
  statusTxt,
  retryAfter,
}: FaucetError) => {
  if (status === 429) {
    let retryTxt = 'later'
    if (retryAfter) {
      // retryTxt = intl.formatNumber(value, {
      //     style: 'unit',
      //     unit,
      //     unitDisplay: 'long',
      // });
      retryTxt = `${Math.ceil(retryAfter / 60)} minute(s)`
    }
    return `Request limit reached, please try again after ${retryTxt}.`
  }
  return `Gas request failed${statusTxt ? `, ${statusTxt}` : ''}.`
}
