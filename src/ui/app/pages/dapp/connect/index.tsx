import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Layout from '_app/layouts'
import { Loading, UserApproveContainer } from '_app/components'

import { useAppDispatch, useAppSelector } from '_hooks'

import {
  permissionsSelectors,
  respondToPermissionRequest,
} from '_redux/slices/permissions'

import CheckIcon from '_assets/icons/check.svg'

import type { PermissionType } from '_messages/payloads/permissions'

const permissionTypeToTxt: Record<PermissionType, string> = {
  viewAccount: 'Share wallet address',
  suggestTransactions: 'Suggest transactions to approve',
}

const ConnectPage = () => {
  const { requestID } = useParams()
  const dispatch = useAppDispatch()
  const permissionsInitialized = useAppSelector(
    ({ permissions }) => permissions.initialized
  )
  const permissionRequest = useAppSelector((state) =>
    requestID ? permissionsSelectors.selectById(state, requestID) : null
  )
  const parsedOrigin = permissionRequest
    ? new URL(permissionRequest.origin)
    : null
  const isSecure = parsedOrigin?.protocol === 'https:'
  const [displayWarning, setDisplayWarning] = useState(!isSecure)

  const activeAccount = useAppSelector(({ account }) => account.address)

  const loading = !permissionsInitialized

  const handleOnSubmit = (allowed: boolean) => {
    if (requestID && activeAccount) {
      dispatch(
        respondToPermissionRequest({
          id: requestID,
          accounts: allowed ? [activeAccount] : [],
          allowed,
        })
      )
    }
  }

  const handleHideWarning = (allowed: boolean) => {
    if (allowed) {
      setDisplayWarning(false)
    } else {
      handleOnSubmit(false)
    }
  }

  const renderContainer = () => {
    if (!permissionRequest) {
      return null
    }

    if (displayWarning) {
      ;<UserApproveContainer
        origin={permissionRequest.origin}
        originFavIcon={permissionRequest.favIcon}
        approveTitle="Continue"
        rejectTitle="Reject"
        onSubmit={handleHideWarning}
        isWarning
        isConnect
      >
        <div className="">
          <h1 className="">Your Connection is Not Secure</h1>
        </div>

        <div className="">
          This site requesting this wallet connection is not secure, and
          attackers might be trying to steal your information.
          <br />
          <br />
          Continue at your own risk.
        </div>
      </UserApproveContainer>
    }

    return (
      <UserApproveContainer
        origin={permissionRequest.origin}
        originFavIcon={permissionRequest.favIcon}
        approveTitle="Connect"
        rejectTitle="Cancel"
        onSubmit={handleOnSubmit}
        isConnect
        requestType="App Permissions"
      >
        <div className="flex flex-col text-sm py-4">
          <span className="mb-4">Allow this site to:</span>
          <ul className="flex flex-col">
            {permissionRequest.permissions.map((aPermission) => (
              <li key={aPermission} className="flex items-center mb-4">
                <CheckIcon className="h-[13px] w-[11px] text-[#6bb7e9] mr-2.5" />
                {permissionTypeToTxt[aPermission]}
              </li>
            ))}
          </ul>
        </div>
      </UserApproveContainer>
    )
  }

  useEffect(() => {
    if (!loading && (!permissionRequest || permissionRequest.responseDate)) {
      window.close()
    }
  }, [loading, permissionRequest])

  useEffect(() => {
    setDisplayWarning(!isSecure)
  }, [isSecure])

  return (
    <Layout showNav={false}>
      <Loading loading={loading}>{renderContainer()}</Loading>
    </Layout>
  )
}

export default ConnectPage
