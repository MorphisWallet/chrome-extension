import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import cl from 'classnames'

import Layout from '_app/layouts'
import { IconWrapper, Button, Loading } from '_app/components'

import { useAppDispatch, useAppSelector, useMiddleEllipsis } from '_hooks'

import {
  addVault,
  getAllAccounts,
  setActiveAccount,
} from '_redux/slices/account'

import type { Account } from '_redux/slices/account'

import ArrowShort from '_assets/icons/arrow_short.svg'
import ImportIcon from '_assets/icons/import.svg'
import SettingsIcon from '_assets/icons/settings.svg'
import AddIcon from '_assets/icons/add.svg'
import Logo from '_assets/icons/logo.svg'

const AccountSelect = ({
  id,
  alias,
  avatar,
  onSetActiveAccount,
}: Account & { onSetActiveAccount: (id: string) => void }) => {
  const { address } = useAppSelector(
    ({ account: { address, alias, avatar } }) => ({
      address,
      alias,
      avatar,
    })
  )
  const idAddress = `0x${id}`
  const isCurrentAccount = address === idAddress

  const shortenAddress = useMiddleEllipsis(idAddress, 10, 7)

  return (
    <div
      onClick={() => onSetActiveAccount(id)}
      className={cl([
        'flex items-center h-[60px] px-4 rounded border cursor-pointer group',
        'transition duration-100 hover:border-[#7db4ff]',
        isCurrentAccount && 'border-[#7db4ff]',
      ])}
    >
      <div className="mr-2">
        {avatar?.[0] === '#' ? (
          <Logo height={28} width={28} color={avatar} />
        ) : (
          <img
            alt="avatar"
            src={avatar}
            className="h-[28px] w-[28px] rounded-full"
          />
        )}
      </div>
      <div className="flex flex-col grow items-start">
        <div>{alias || 'No name'}</div>
        <div className="text-[#c0c0c0]">{shortenAddress}</div>
      </div>
      <Link
        to={`./${address}`}
        className="invisible transition duration-100 ease-in-out hover:scale-110 group-hover:visible"
      >
        <SettingsIcon height={19} width={18} />
      </Link>
    </div>
  )
}

const WalletManagementPage = () => {
  const dispatch = useAppDispatch()

  const [allAccounts, setAllAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)

  const onAddWallet = async () => {
    await dispatch(addVault({}))
    fetchAllAccounts()
  }

  const fetchAllAccounts = async () => {
    setLoading(true)

    const _allAccounts = await dispatch(getAllAccounts()).unwrap()

    setAllAccounts(_allAccounts)
    setLoading(false)
  }

  const onSetActiveAccount = async (id: string) => {
    setLoading(true)

    await dispatch(setActiveAccount(id)).unwrap()

    setLoading(false)
  }

  useEffect(() => {
    fetchAllAccounts()
  }, [])

  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
        <div className="mb-6 text-xl text-center font-bold relative">
          Wallet Management
          <Link to="/" className="absolute left-0 top-[7px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <div className="flex flex-col grow overflow-y-auto px-6 mx-[-24px]">
          <div className="flex flex-col gap-2">
            <Loading loading={loading}>
              {allAccounts.map((_account) => (
                <AccountSelect
                  key={_account.id}
                  {..._account}
                  onSetActiveAccount={onSetActiveAccount}
                />
              ))}
            </Loading>

            <Button
              onClick={onAddWallet}
              className="flex items-center h-[60px] px-4 rounded border border-[#e2e2e2] transition duration-300 ease-in-out hover:border-[#7db4ff]"
            >
              <div className="mr-2">
                <AddIcon height={28} width={28} />
              </div>
              <div>Add a new account</div>
            </Button>
          </div>
          <hr className="my-6 border-black" />
          <Button
            data-tip="Coming soon"
            data-for="button-tip"
            variant="outlined"
            className="flex justify-center items-center shrink-0 rounded-[4px] cursor-not-allowed font-bold"
          >
            <ImportIcon height={13} width={9} className="mr-3" />
            Import an existing wallet
          </Button>
          <ReactTooltip
            id="button-tip"
            effect="solid"
            className="before:hidden"
            backgroundColor="#000000"
          />
        </div>
      </div>
    </Layout>
  )
}

export default WalletManagementPage
