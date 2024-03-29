import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import Layout from '_app/layouts'
import { Loading } from '_app/components'
import { UserApproveContainer } from '../components/user_approval_container'

import { useAppDispatch, useAppSelector, useActiveAddress } from '_hooks'

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
  const activeAddress = useActiveAddress()
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

  const loading = !permissionsInitialized

  const handleOnSubmit = (allowed: boolean) => {
    if (requestID && activeAddress) {
      dispatch(
        respondToPermissionRequest({
          id: requestID,
          accounts: allowed ? [activeAddress] : [],
          allowed,
        })
      )
    }
  }

  const renderContainer = () => {
    if (!permissionRequest) {
      return null
    }

    return (
      <UserApproveContainer
        title="Approve Request"
        origin={permissionRequest.origin}
        originFavIcon={permissionRequest.favIcon}
        approveTitle="Connect"
        rejectTitle="Cancel"
        onSubmit={handleOnSubmit}
        isWarning={!isSecure}
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

  return (
    <Layout showNav={false}>
      <Loading loading={loading}>{renderContainer()}</Loading>
    </Layout>
  )
}

export default ConnectPage
