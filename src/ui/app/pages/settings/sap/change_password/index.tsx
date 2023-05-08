import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import Layout from '_app/layouts'
import { IconWrapper, Input, Button, toast } from '_app/components'

import { useBackgroundClient } from '_src/ui/app/hooks/useBackgroundClient'

import {
  passwordValidation,
  getConfirmPasswordValidation,
} from '_src/ui/utils/validation'

import ArrowShort from '_assets/icons/arrow_short.svg'

type Fields = {
  oldPassword: string
  password: string
  confirmedPassword: string
}

const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const backgroundService = useBackgroundClient()
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldError,
  } = useFormik<Fields>({
    initialValues: { oldPassword: '', password: '', confirmedPassword: '' },
    validationSchema: Yup.object().shape({
      oldPassword: passwordValidation,
      password: passwordValidation,
      confirmedPassword: getConfirmPasswordValidation('password'),
    }),
    onSubmit,
  })

  async function onSubmit({ oldPassword, password }: Fields) {
    if (oldPassword === password) {
      setFieldError(
        'password',
        'New password should not be the same as the old one'
      )
      return
    }

    try {
      await backgroundService.changePassword(oldPassword, password)

      navigate('/settings/sap')
      setTimeout(() => {
        toast({
          type: 'success',
          message: 'Successfully changed password',
        })
      }, 0)
    } catch (e) {
      setFieldError('oldPassword', (e as Error)?.message || 'Wrong password')
    }
  }

  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6">
        <div className="mb-6 text-xl text-center font-bold relative">
          Change password
          <Link to="/settings/sap" className="absolute left-0 top-[7px]">
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </Link>
        </div>
        <form className="flex flex-col grow" onSubmit={handleSubmit}>
          <fieldset className="flex flex-col grow">
            <Input
              id="oldPassword"
              name="oldPassword"
              value={values.oldPassword}
              error={touched.oldPassword && errors.oldPassword}
              type="password"
              placeholder="Current password"
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-3"
              inputClassName="rounded-[4px] px-4"
            />
            <Input
              id="password"
              name="password"
              value={values.password}
              error={touched.password && errors.password}
              type="password"
              placeholder="Password"
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-3"
              inputClassName="rounded-[4px] px-4"
            />
            <Input
              id="confirmedPassword"
              name="confirmedPassword"
              value={values.confirmedPassword}
              error={touched.confirmedPassword && errors.confirmedPassword}
              type="password"
              placeholder="Repeat password"
              onChange={handleChange}
              onBlur={handleBlur}
              inputClassName="rounded-[4px] px-4"
            />
            <div className="grow" />
            <Button type="submit" loading={isSubmitting} variant="contained">
              Save
            </Button>
          </fieldset>
        </form>
      </div>
    </Layout>
  )
}

export default ChangePasswordPage
