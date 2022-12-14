import { useState } from 'react'
import { Link } from 'react-router-dom'

import Layout from '_app/layouts'
import { IconWrapper, SeedPhraseCard } from '_app/components'
import Confirm from '../_components/confirm'

import ArrowShort from '_assets/icons/arrow_short.svg'

const SeedPhrasePage = () => {
  const [showConfirm, setShowConfirm] = useState(true)

  return (
    <Layout showNav={!showConfirm}>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
        <div className="mb-6 text-xl text-center font-bold relative">
          Seed Phrase
          <Link to="/settings/sap" className="absolute left-0 top-[7px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        {showConfirm ? (
          <Confirm
            subject="Seed Phrase"
            onSuccess={() => setShowConfirm(false)}
          />
        ) : (
          <SeedPhraseCard />
        )}
      </div>
    </Layout>
  )
}

export default SeedPhrasePage
