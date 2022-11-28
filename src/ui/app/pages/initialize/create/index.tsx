import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Formik } from 'formik'
import * as Yup from 'yup'

import { Layout } from '_app/layouts'
import { Loading } from '_components/loading'
import { Stepper, Input, Checkbox, Button, Alert } from '_components/index'

import { useAppDispatch, useInitializedGuard, useLockedGuard } from '_hooks'

import { createVault } from '_redux/slices/account'

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
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const initGuardLoading = useInitializedGuard(true)
  const lockedGuardLoading = useLockedGuard(true)

  const onPrev = () => navigate('/welcome')

  const onSubmit = async (values: Fields) => {
    try {
      await dispatch(createVault({ password: values.password })).unwrap()
      navigate('/initialize/backup')
    } catch (e) {
      toast(<Alert type="error">{`Failed to create vault, ${e}`}</Alert>, {
        toastId: 'initialize-toast',
      })
    }
  }

  const guardsLoading = initGuardLoading || lockedGuardLoading

  return (
    <Loading loading={guardsLoading}>
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
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col grow pt-20"
              >
                <p className="text-2xl font-medium mb-3">Create a password</p>
                <p className="text-lg text-[#929294] leading-6 mb-8">
                  We will use this to unlock your wallet
                </p>
                <fieldset className="flex flex-col grow">
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
                  />
                  <Input
                    id="confirmedPassword"
                    name="confirmedPassword"
                    value={values.confirmedPassword}
                    error={
                      touched.confirmedPassword && errors.confirmedPassword
                    }
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
                    error={touched.tos && !!errors.tos}
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
    </Loading>
  )
}
