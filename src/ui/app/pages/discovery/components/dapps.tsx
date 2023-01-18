import cl from 'classnames'

import { Button } from '_src/ui/app/components'

import Clutchy from '_assets/discovery/dapps/clutchy.svg'
import Araya from '_assets/discovery/dapps/araya.svg'
import Suins from '_assets/discovery/dapps/suins.svg'
import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

type DiscoveryAppItem = {
  name: string
  image: React.ReactElement | string
  link: string
}

const TOP_DAPPS: DiscoveryAppItem[] = [
  {
    name: 'Clutchy',
    image: <Clutchy height="100%" width="100%" />,
    link: 'https://clutchy.io/',
  },
  {
    name: 'Araya Finance',
    image: <Araya height="100%" width="100%" />,
    link: 'https://arayafi.org/',
  },
  {
    name: 'Suins',
    image: <Suins height="100%" width="100%" />,
    link: 'https://SuiNS.io/',
  },
]

const LIST_DAPPS: DiscoveryAppItem[] = [
  {
    name: 'BlueMove',
    image:
      'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F3844695736-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F5L6W3ATZ7Z24OoaKAQCi%252Ficon%252FD893F1eVQqeXLyV7DVu6%252FBlueMove_main_logo_RGB-Blue_1024.png%3Falt%3Dmedia%26token%3Db01a75c4-6e0f-4040-9aeb-64c31c652355',
    link: 'https://bluemove.net/',
  },
  {
    name: 'Cetus',
    image:
      'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1531916577-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F8SWjCXiKjhHxRWaXqCU9%252Ficon%252FsodkAqQEd7VW2REzhsk2%252F02.png%3Falt%3Dmedia%26token%3D699a1493-bd9f-4357-a9cd-1aa63fad2994',
    link: 'https://app.cetus.zone/',
  },
  {
    name: 'Ballast',
    image:
      'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F478234359-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F5VP4IR9XFqi7oUxPBC5V%252Ficon%252FH0EicOxdSgMHZex4D41h%252Flogo1-3.png%3Falt%3Dmedia%26token%3D44707064-dd95-4cc7-871b-b9d58729558f',
    link: 'https://www.ballast.fi/',
  },
  {
    name: 'Turbos',
    image:
      'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F3572405333-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FBW1gFbVfaPQIKFmdH5yc%252Ficon%252FxJIrNp682bPEnfmORz45%252FTurbos%2520%2520logo%25E7%25BB%2584%25E5%2590%2588-06.png%3Falt%3Dmedia%26token%3D5d2c9633-517f-4df0-b5c3-f17510418b03',
    link: 'https://www.turbos.finance/',
  },
  {
    name: 'SuiSwap',
    image:
      'https://pbs.twimg.com/profile_images/1597664871155261440/xvGBQkni_400x400.jpg',
    link: 'http://suiswap.app',
  },
  {
    name: 'Tocen launchpad',
    image:
      'https://dev.tocen.co/_next/image?url=https%3A%2F%2Fcms-dev.tocen.co%2Fuploads%2Ftocen_logo_607e526066.png&w=2048&q=75',
    link: 'https://dev.tocen.co/',
  },
  {
    name: 'Trellis',
    image:
      'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F3882943413-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FRT7SvReCjMwrMWadUtTt%252Ficon%252FI3par3fhbnsWHDzklyQx%252FGroup%2520464%2520(6).png%3Falt%3Dmedia%26token%3Daee831e0-8b27-409b-a1d8-66867fe4b45f',
    link: 'https://trellis.fi/',
  },
  {
    name: 'Owlswap',
    image: 'https://avatars.githubusercontent.com/u/116796432?v=4',
    link: 'https://owlswap.finance/',
  },
  {
    name: 'SuiPad',
    image:
      'https://suipad.xyz/wp-content/uploads/2022/10/cropped-1-1-300x300.png',
    link: 'https://suipad.xyz/',
  },
]

const Card = ({ name, image, link }: DiscoveryAppItem) => (
  <a
    href={link}
    target="_blank"
    rel="noreferrer"
    className={cl([
      'flex flex-col shrink-0 h-[170px] w-[128px] px-1 py-2 border border-[#f2f2f2] shadow-[0_4px_10px_rgba(184, 184, 184, 0.25)] cursor-pointer',
      'transition hover:scale-105 hover:bg-[#fdede5]',
    ])}
  >
    <div className="h-[118px] rounded overflow-hidden">
      {typeof image === 'string' ? <img alt={name} src={image} /> : image}
    </div>
    <div className="grow mt-2 font-bold truncate">{name}</div>
  </a>
)

const Dapps = () => (
  <>
    <div className="shrink-0 overflow-hidden mx-[-24px]">
      <div className="flex mt-4 px-6 gap-2 overflow-x-auto overflow-y-hidden hide-scrollbar">
        {TOP_DAPPS.map((_dapp) => (
          <Card key={_dapp.name} {..._dapp} />
        ))}
      </div>
    </div>
    <div className="flex flex-col grow gap-4 mx-[-24px] mb-[-24px] px-6 py-2 overflow-y-auto">
      {LIST_DAPPS.map(({ name, image, link }) => (
        <div key={name} className="flex items-center gap-4">
          {typeof image === 'string' ? (
            <img
              alt={name}
              src={image}
              className="shrink-0 w-[50px] h-[50px] rounded-full"
            />
          ) : (
            image
          )}
          <span className="grow text-sm font-bold truncate">{name}</span>
          <a href={link} target="_blank" rel="noreferrer">
            <Button className="h-6 w-6 px-0 mb-2 bg-[#1da1f2] rounded-full flex justify-center items-center hover:bg-[#1da1f2] hover:scale-105">
              <ArrowIcon height={10} width={10} />
            </Button>
          </a>
        </div>
      ))}
    </div>
  </>
)

export default Dapps
