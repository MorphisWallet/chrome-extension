import { Link } from 'react-router-dom'
import { Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import Layout from '_app/layouts'
import { Loading, Input, Button } from '_app/components'

import { useAppDispatch, useInitializedGuard, useLockedGuard } from '_hooks'

import { unlockWallet } from '_redux/slices/wallet'

import { passwordValidation } from '_src/ui/utils/validation'

import Logo from '_assets/icons/logo.svg'

type PasswordField = {
  password: string
}

const LockedPage = () => {
  const dispatch = useAppDispatch()
  const initGuardLoading = useInitializedGuard(true)
  const lockedGuardLoading = useLockedGuard(true)

  const guardsLoading = initGuardLoading || lockedGuardLoading

  const onSubmit = async (
    { password }: PasswordField,
    { setFieldError }: FormikHelpers<PasswordField>
  ) => {
    try {
      await dispatch(unlockWallet({ password })).unwrap()
    } catch (e) {
      setFieldError('password', (e as Error)?.message || 'Incorrect password')
    }
  }

  return (
    <Loading loading={guardsLoading}>
      <Layout showHeader={false} showNav={false}>
        <div className="flex flex-col grow p-10">
          <div className="flex flex-col grow justify-center items-center font-medium mb-12">
            <a
              href="https://morphiswallet.com"
              target="_blank"
              rel="noreferrer"
            >
              <Logo height={55} width={57} className="mb-4" />
            </a>
            <p className="text-2xl font-bold mb-10">Welcome back!</p>
            <Formik
              initialValues={{ password: '' }}
              validationSchema={Yup.object().shape({
                password: passwordValidation,
              })}
              onSubmit={onSubmit}
            >
              {({
                values,
                touched,
                errors,
                handleBlur,
                handleChange,
                handleSubmit,
              }) => (
                <form onSubmit={handleSubmit} className="w-full">
                  <Input
                    id="password"
                    name="password"
                    value={values.password}
                    error={touched.password && errors.password}
                    type="password"
                    placeholder="Password"
                    className="mb-4"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <Button type="submit" variant="contained">
                    Unlock
                  </Button>
                </form>
              )}
            </Formik>
          </div>
          <Link
            to="/initialize/import?type=forgot"
            className="text-sm text-[#818181] text-center font-medium"
          >
            <span>Forgot password?</span>
          </Link>
        </div>
      </Layout>
    </Loading>
  )
}

export default LockedPage
