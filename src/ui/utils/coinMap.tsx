import BNB from '_assets/icons/coins/bnb.svg'
import BTC from '_assets/icons/coins/btc.svg'
import ETH from '_assets/icons/coins/eth.svg'
import MATIC from '_assets/icons/coins/matic.svg'
import SOL from '_assets/icons/coins/sol.svg'
import SUI from '_assets/icons/coins/sui.svg'
import USDC from '_assets/icons/coins/usdc.svg'
import USDT from '_assets/icons/coins/usdt.svg'

export type CoinInfo = {
  name: string
  icon: (props?: React.SVGProps<SVGElement>) => React.ReactNode
}

export const coinMap: Record<string, CoinInfo> = {
  BNB: { name: 'SUI', icon: (props) => <BNB {...props} /> },
  WBNB: { name: 'WBNB', icon: (props) => <BNB {...props} /> },
  BTC: { name: 'BTC', icon: (props) => <BTC {...props} /> },
  WBTC: { name: 'WBTC', icon: (props) => <BTC {...props} /> },
  tBTC: { name: 'tBTC', icon: (props) => <BTC {...props} /> },
  ETH: { name: 'ETH', icon: (props) => <ETH {...props} /> },
  WETH: { name: 'WETH', icon: (props) => <ETH {...props} /> },
  MATIC: { name: 'MATIC', icon: (props) => <MATIC {...props} /> },
  WMATIC: { name: 'WMATIC', icon: (props) => <MATIC {...props} /> },
  SOL: { name: 'SOL', icon: (props) => <SOL {...props} /> },
  WSOL: { name: 'WSOL', icon: (props) => <SOL {...props} /> },
  SUI: { name: 'Sui', icon: (props) => <SUI {...props} /> },
  USDC: { name: 'USDC', icon: (props) => <USDC {...props} /> },
  USDCsol: { name: 'USDCsol', icon: (props) => <USDC {...props} /> },
  USDCbnb: { name: 'USDCbnb', icon: (props) => <USDC {...props} /> },
  USDCpol: { name: 'USDCpol', icon: (props) => <USDC {...props} /> },
  USDCarb: { name: 'USDCarb', icon: (props) => <USDC {...props} /> },
  USDT: { name: 'USDT', icon: (props) => <USDT {...props} /> },
}
