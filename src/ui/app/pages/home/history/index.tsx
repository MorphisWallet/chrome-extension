import { Layout } from '_app/layouts'

import ComingSoonImg from '_assets/icons/coming_soon.svg'

export const History = () => {
  return (
    <Layout>
      <div className="flex flex-col grow items-center justify-center">
        <ComingSoonImg height={252} width={328} className="mb-5" />
        <p className="text-[28px] font-black text-center">COMING</p>
        <p className="text-[28px] font-black text-center">SOON</p>
      </div>
    </Layout>
  )
}
