import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import Layout from '_app/layouts'
import {
  IconWrapper,
  Address,
  Input,
  Button,
  toast,
  Avatar,
} from '_app/components'

import { useAppDispatch, useAppSelector } from '_hooks'

import { setMeta, createAccountSelector } from '_redux/slices/account'

import ArrowShort from '_assets/icons/arrow_short.svg'

const UpdateWalletMetaPage = () => {
  const { address } = useParams()
  const dispatch = useAppDispatch()
  const account = useAppSelector(createAccountSelector(address || ''))
  if (!account) return null

  const { alias, avatar } = account

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
  } = useFormik<{ alias: string }>({
    initialValues: {
      alias: alias || '',
    },
    validationSchema: Yup.object().shape({
      alias: Yup.string().min(1).max(16).required('At least one character'),
    }),
    onSubmit: async ({ alias: _alias }) => {
      if (!address) return

      try {
        await dispatch(
          setMeta({
            address,
            alias: alias === _alias ? undefined : _alias,
            avatar: avatar === avatarPath ? undefined : avatarPath || undefined,
          })
        ).unwrap()
        toast({
          type: 'success',
          message: 'Successfully updated name and avatar',
        })
      } catch (err) {
        toast({
          type: 'error',
          message:
            (err as Error)?.message || 'Failed to update name and avatar',
        })
      }
    },
  })
  const [avatarPath, setAvatarPath] = useState(avatar)

  const onUpload = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const file = (e.target as HTMLInputElement)?.files?.[0]
    if (!file || !/image/.test(file.type)) {
      toast({
        type: 'error',
        message: 'Invalid file',
      })
      return
    }
    if (file.size > 500 * 1024) {
      toast({
        type: 'error',
        message: 'Avatar should be not larger than 500KB',
      })
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      const base64data = reader.result as string
      setAvatarPath(base64data)
    }
  }

  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow shrink-0 font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
        <div className="mb-2 text-xl text-center font-bold relative">
          {alias || 'Account'}
          <Link
            to="/settings/wallet-management"
            className="absolute left-0 top-[7px]"
          >
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <div className="flex flex-col grow">
          <div className="mb-4">
            <Address addressOnly address={address} />
          </div>
          <div className="mb-6 mx-auto rounded-full overflow-hidden h-[102px] w-[102px] relative">
            <label
              htmlFor="upload"
              className="absolute inset-0 cursor-pointer"
            />
            <input
              id="upload"
              type="file"
              accept="image/*"
              className="opacity-0 absolute z-[-1]"
              onChange={onUpload}
            />
            <Avatar avatar={avatarPath} size={102} />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col grow">
            <label htmlFor="alias">Name</label>
            <Input
              id="alias"
              name="alias"
              className="mb-3.5"
              inputClassName="px-4 rounded-[4px] mb-0"
              disabled={isSubmitting}
              value={values.alias}
              error={touched.alias && errors.alias}
              placeholder="Input your custom wallet name"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="grow" />
            <Button
              loading={isSubmitting}
              disabled={values.alias === alias && avatar === avatarPath}
              variant="contained"
              type="submit"
            >
              Save
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default UpdateWalletMetaPage
