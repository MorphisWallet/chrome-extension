import { useState, useEffect } from 'react'
import cl from 'classnames'

import { TxLink } from '_app/components'

import { useMiddleEllipsis } from '_hooks'

import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'
import type { MetadataGroup } from '../types'

type TabType = 'transfer' | 'modify' | 'read'

type PermissionsProps = {
  metadata: {
    transfer: MetadataGroup
    modify: MetadataGroup
    read: MetadataGroup
  } | null
}

function PassedObject({ id, module }: { id: string; module: string }) {
  const objectId = useMiddleEllipsis(id)
  return (
    <div>
      <TxLink type={ExplorerLinkType.object} objectID={id} className="">
        {objectId}
      </TxLink>
      <div className="">{module}</div>
    </div>
  )
}

export default function Permissions({ metadata }: PermissionsProps) {
  const [tab, setTab] = useState<TabType | null>(null)
  // Set the initial tab state to whatever is visible:
  useEffect(() => {
    if (tab || !metadata) return
    setTab(
      metadata.transfer.children.length
        ? 'transfer'
        : metadata.modify.children.length
        ? 'modify'
        : metadata.read.children.length
        ? 'read'
        : null
    )
  }, [tab, metadata])
  return (
    metadata &&
    tab && (
      <div className="">
        <div className="">Permissions requested</div>
        <div className="">
          <div className="">
            {Object.entries(metadata).map(
              ([key, value]) =>
                value.children.length > 0 && (
                  <button
                    type="button"
                    key={key}
                    className={cl('', tab === key && '')}
                    // eslint-disable-next-line react/jsx-no-bind
                    onClick={() => {
                      setTab(key as TabType)
                    }}
                  >
                    {value.name}
                  </button>
                )
            )}
          </div>
          <div className="">
            {metadata[tab].children.map(({ id, module }, index) => (
              <PassedObject key={index} id={id} module={module} />
            ))}
          </div>
        </div>
      </div>
    )
  )
}
