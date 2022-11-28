import { Layout } from '_app/layouts'
import { Button } from '_app/components'

import ArrowIcon from '_assets/icons/arrow_short_thin.svg'

export const Landing = () => {
  return (
    <Layout>
      <div className="flex flex-col font-medium">
        <div className="flex flex-col h-[180px] justify-center items-center py-6 border-b border-b-[#e7e7e9]">
          <p className="mb-6">100.2345 SUI</p>
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col items-center">
              <Button className="h-[40px] w-[40px] px-0 mb-2 rounded-full flex justify-center items-center">
                <ArrowIcon className="rotate-180" />
              </Button>
              <span>Airdrop</span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                variant="outlined"
                className="h-[40px] w-[40px] px-0 mb-2 rounded-full flex justify-center items-center"
              >
                <ArrowIcon />
              </Button>
              <span>Send</span>
            </div>
          </div>
        </div>
        <div className="px-8"></div>
      </div>
    </Layout>
  )
}
