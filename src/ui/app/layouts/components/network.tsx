import { useState, useEffect, useMemo } from 'react'

import { IconWrapper } from '_components/icon_wrapper'

import { useAppDispatch, useAppSelector } from '_src/ui/app/hooks'

import { changeRPCNetwork } from '_redux/slices/app'
import {
  API_ENV_TO_INFO,
  API_ENV,
  generateActiveNetworkList,
} from '_app/ApiProvider'

import BackArrow from '_assets/icons/arrow_short.svg'

type NetworkProps = {
  setModalOpen: (open: boolean) => void
}

const Network = ({ setModalOpen }: NetworkProps) => {
  const dispatch = useAppDispatch()
  const selectedApiEnv = useAppSelector(({ app }) => app.apiEnv)

  const [selectedNetworkName, setSelectedNetworkName] =
    useState<API_ENV>(selectedApiEnv)

  const netWorks = useMemo(() => {
    return generateActiveNetworkList()
      .map((itm) => ({
        ...API_ENV_TO_INFO[itm as keyof typeof API_ENV],
        networkName: itm,
      }))
      .filter((nw) => nw.networkName !== 'customRPC') // currently do not support custom RPC
  }, [])

  useEffect(() => {
    setSelectedNetworkName(selectedApiEnv)
  }, [selectedApiEnv])

  const onSelectNetwork = (networkName: API_ENV) => {
    const apiEnv = API_ENV[networkName as keyof typeof API_ENV]
    dispatch(changeRPCNetwork(apiEnv))
  }

  return (
    <>
      <div className="h-12 px-6 flex justify-center items-center relative border-b border-b-[#e6e6e9]">
        <IconWrapper
          onClick={() => setModalOpen(false)}
          className="absolute left-6"
        >
          <BackArrow />
        </IconWrapper>
        <span className="text-xl font-bold">Network</span>
      </div>
      <ul className="flex flex-col p-6 gap-2 m-0 list-none">
        {netWorks.map((nw) => (
          <li
            key={nw.name}
            className="px-3.5 py-3 border border-solid border-[#c4c4c4] rounded cursor-pointer hover:bg-[#f5f5f5] active:bg-[#c4c4c4] flex flex-row items-center justify-between"
            onClick={() => onSelectNetwork(nw.networkName as API_ENV)}
          >
            <div className="flex flex-row items-center font-medium">
              {nw.name}
            </div>
            {selectedNetworkName === nw.networkName && (
              <div className="w-3 h-3 bg-[#82ffac] rounded-full" />
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

export default Network
