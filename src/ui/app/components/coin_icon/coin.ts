export type CoinData = {
  name: string
  symbol: string
  coin_type: string
  coingecko_id?: string
  decimals: number
  icon_url: string
  project_url: string
  source: string
  wrapped?: {
    bridge: string
    chain: string
  }
}
