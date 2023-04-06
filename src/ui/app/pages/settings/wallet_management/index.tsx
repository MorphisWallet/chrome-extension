import { Link } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import cl from 'classnames'
import { SuiAddress, formatAddress } from '@mysten/sui.js'

import Layout from '_app/layouts'
import { IconWrapper, Button, Avatar, toast } from '_app/components'

import { useAccountsMeta, useActiveAddress } from '_hooks'
import { useAccounts } from '_src/ui/app/hooks/useAccounts'
import { useDeriveNextAccountMutation } from '_src/ui/app/hooks/useDeriveNextAccountMutation'

import {} from '_redux/slices/account'

import ArrowShort from '_assets/icons/arrow_short.svg'
import ImportIcon from '_assets/icons/import.svg'
import SettingsIcon from '_assets/icons/settings.svg'
import AddIcon from '_assets/icons/add.svg'
import { useEffect } from 'react'

type AccountSelectProps = {
  address: SuiAddress
  onSetActiveAccount: (address: SuiAddress) => void
}

const AccountSelect = ({ address, onSetActiveAccount }: AccountSelectProps) => {
  const accountsMeta = useAccountsMeta()
  const addressMeta = accountsMeta[address]

  const activeAccountAddress = useActiveAddress()
  const isCurrentAccount = address === activeAccountAddress

  return (
    <div
      onClick={() => onSetActiveAccount(address)}
      className={cl([
        'flex items-center h-[60px] px-4 rounded border cursor-pointer group',
        'transition duration-100 hover:border-[#7db4ff]',
        isCurrentAccount && 'border-[#7db4ff]',
      ])}
    >
      <div className="mr-2">
        <Avatar avatar={addressMeta?.avatar || ''} size={28} />
      </div>
      <div className="flex flex-col grow items-start">
        <div>{addressMeta?.alias || ''}</div>
        <div className="text-[#c0c0c0]">{formatAddress(address || '')}</div>
      </div>
      <Link
        to={`./${address}`}
        onClick={(e) => e.stopPropagation()}
        className="invisible transition duration-100 ease-in-out hover:scale-110 group-hover:visible"
      >
        <SettingsIcon height={19} width={18} />
      </Link>
    </div>
  )
}

const WalletManagementPage = () => {
  const accounts = useAccounts()
  const createAccountMutation = useDeriveNextAccountMutation()

  useEffect(() => {
    if (createAccountMutation.isError) {
      toast({
        type: 'error',
        message:
          (createAccountMutation.error as Error).message ||
          'Fail to create new account',
      })
    }
  }, [createAccountMutation.isError])

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
            {accounts.map((_account) => (
              <AccountSelect
                key={_account.address}
                {..._account}
                onSetActiveAccount={() => null}
              />
            ))}
            <Button
              className="flex items-center shrink-0 h-[60px] px-4 !rounded border border-[#e2e2e2] transition duration-300 ease-in-out hover:border-[#7db4ff]"
              loading={createAccountMutation.isLoading}
              onClick={() => createAccountMutation.mutate()}
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
