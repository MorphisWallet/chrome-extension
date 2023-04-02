import Sui from '_assets/icons/coins/sui.svg'

export type CoinInfo = {
  name: string
  icon: (props?: React.SVGProps<SVGElement>) => React.ReactNode
}

export const coinMap: Record<string, CoinInfo> = {
  '0x2::sui::SUI': { name: 'Sui', icon: (props) => <Sui {...props} /> },
}
