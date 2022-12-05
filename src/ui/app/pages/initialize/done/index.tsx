import { Layout } from '_app/layouts'
import { Button } from '_components/button'

import { MAIN_UI_URL } from '_shared/utils'

import Logo from '_assets/icons/logo.svg'
import TwitterIcon from '_assets/icons/twitter.svg'
import DiscordIcon from '_assets/icons/discord.svg'

const DonePage = () => (
  <Layout showHeader={false} showNav={false}>
    <div className="flex flex-col grow justify-center p-10 font-medium">
      <a href="https://morphiswallet.com" target="_blank" rel="noreferrer">
        <Logo height={55} width={57} className="mb-6" />
      </a>
      <p className="text-2xl leading-[48px] mb-3">You are all done!</p>
      <p className="text-lg text-[#929294] leading-6 mb-10">
        Follow us to get the latest offers and product updates!
      </p>
      <a
        className="mb-2"
        href="https://twitter.com/morphis_wallet"
        target="_blank"
        rel="noreferrer"
      >
        <Button className="h-[56px] rounded-[28px] relative">
          <div className="absolute h-8 w-8 rounded-full bg-[#ffffff] text-black flex justify-center items-center top-3 left-6">
            <TwitterIcon />
          </div>
          Follow us on Twitter
        </Button>
      </a>
      <a href="http://discord.gg/morphis" target="_blank" rel="noreferrer">
        <Button className="h-[56px] rounded-[28px] relative">
          <div className="absolute h-8 w-8 rounded-full bg-[#ffffff] text-black flex justify-center items-center top-3 left-6">
            <DiscordIcon />
          </div>
          Join our Discord
        </Button>
      </a>
      <div className="grow" />
      <a href={MAIN_UI_URL}>
        <Button variant="outlined">Finish</Button>
      </a>
    </div>
  </Layout>
)

export default DonePage
