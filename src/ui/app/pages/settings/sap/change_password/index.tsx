import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import Layout from '_app/layouts'
import { IconWrapper, Input, Button } from '_app/components'

import {
  passwordValidation,
  getConfirmPasswordValidation,
} from '_app/utils/validation'

import ArrowShort from '_assets/icons/arrow_short.svg'

type Fields = {
  oldPassword: string
  password: string
  confirmedPassword: string
}

const ChangePasswordPage = () => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useFormik<Fields>({
    initialValues: { oldPassword: '', password: '', confirmedPassword: '' },
    validationSchema: Yup.object().shape({
      oldPassword: passwordValidation,
      password: passwordValidation,
      confirmedPassword: getConfirmPasswordValidation('password'),
    }),
    onSubmit,
  })

  async function onSubmit(values: Fields) {
    console.log(values)
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
