import { Link } from 'react-router-dom'

import { useInitializedGuard } from '_hooks'

import Layout from '_app/layouts'
import { Loading, Button } from '_app/components'

import Logo from '_assets/icons/logo.svg'

const WelcomePage = () => {
  const checkingInitialized = useInitializedGuard(false)

  return (
    <Loading loading={checkingInitialized}>
      <Layout showHeader={false} showNav={false}>
        <div className="flex flex-col grow justify-center p-10 font-medium">
          <a href="https://morphiswallet.com" target="_blank" rel="noreferrer">
            <Logo height={55} width={57} className="mb-6" />
          </a>
          <p className="text-4xl leading-[48px] mb-3">Morphis</p>
          <p className="text-lg text-[#929294] leading-6 mb-8">
            A friendly crypto wallet for your web3 journey
          </p>
          <Link to="/initialize" className="w-full mb-4">
            <Button variant="contained">Create a new wallet</Button>
          </Link>
          <Link to="/initialize/import" className="w-full">
            <Button variant="outlined">I already have a wallet</Button>
          </Link>
        </div>
      </Layout>
    </Loading>
  )
}

export default WelcomePage
