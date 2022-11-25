import { useNavigate } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'

import { Layout } from '_app/layouts'
import { Stepper } from '_components/stepper'
import { Input } from '_components/input'
import { Checkbox } from '_components/checkbox'
import { Button } from '_components/button'

import {
  passwordValidation,
  getConfirmPasswordValidation,
} from '_app/utils/validation'

type Fields = {
  password: string
  confirmedPassword: string
  tos: boolean
}

export const Create = () => {
  const naviate = useNavigate()

  const onPrev = () => naviate('/welcome')

  const onSubmit = (values: Fields) => console.log(values)

  return (
    <Layout showHeader={false} showNav={false}>
      <div className="flex flex-col grow px-10 pb-10">
        <Stepper steps={3} current={0} onPrev={onPrev} />
        <Formik
          initialValues={{ password: '', confirmedPassword: '', tos: false }}
          validationSchema={Yup.object().shape({
            password: passwordValidation,
            confirmedPassword: getConfirmPasswordValidation('password'),
            tos: Yup.boolean()
              .required()
              .oneOf([true], 'Terms of service must be accepted'),
          })}
          onSubmit={onSubmit}
        >
          {({ values, errors, handleChange, handleBlur, handleSubmit }) => (
            <form onSubmit={handleSubmit} className="flex flex-col grow pt-20">
              <p className="text-2xl font-medium mb-3">Create a password</p>
              <p className="text-lg text-[#929294] leading-6 mb-8">
                We will use this to unlock your wallet
              </p>
              <fieldset className="flex flex-col grow">
                <Input
                  id="password"
                  name="password"
                  value={values.password}
                  error={errors.password}
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mb-3"
                />
                <Input
                  id="confirmedPassword"
                  name="confirmedPassword"
                  value={values.confirmedPassword}
                  error={errors.confirmedPassword}
                  type="password"
                  placeholder="Confirm password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div className="grow" />
                <Checkbox
                  id="tos"
                  name="tos"
                  checked={values.tos}
                  onChange={handleChange}
                  className="mb-4"
                  error={!!errors.tos}
                  label={
                    <>
                      I agree to the{' '}
                      <a
                        href=""
                        target="_blank"
                        className="underline hover:text-[#c4c4c4]"
                      >
                        Terms of Service
                      </a>
                    </>
                  }
                />
                <Button type="submit" variant="contained">
                  Unlock
                </Button>
              </fieldset>
            </form>
          )}
        </Formik>
      </div>
    </Layout>
  )
}
