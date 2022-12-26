import { Link } from 'react-router-dom'
import { useFormik } from 'formik'

import Layout from '_app/layouts'
import { IconWrapper, Address, Input, Button, toast } from '_app/components'

import { useAppDispatch, useAppSelector } from '_hooks'

import { setMeta } from '_redux/slices/account'

import ArrowShort from '_assets/icons/arrow_short.svg'
import Logo from '_assets/icons/logo.svg'

const UpdateWalletMetaPage = () => {
  const dispatch = useAppDispatch()
  const { alias, avatar } = useAppSelector(({ account }) => ({
    alias: account.alias,
    avatar: account.avatar,
  }))
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
    onSubmit: async ({ alias }) => {
      try {
        await dispatch(setMeta({ alias })).unwrap()
        toast({
          type: 'success',
          message: 'Successfully updated name and avatar',
        })
      } catch (e) {
        //
      }
    },
  })

  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow shrink-0 font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
        <div className="mb-2 text-xl text-center font-bold relative">
          {alias}
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
            <Address addressOnly />
          </div>
          <div className="mb-6 mx-auto rounded-full overflow-hidden h-[102px] w-[102px]">
            {avatar ? (
              <img alt="avatar" src={avatar} className="h-full w-full" />
            ) : (
              <Logo height="100%" width="100%" />
            )}
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
              disabled={values.alias === alias}
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
