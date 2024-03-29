import { useNavigate } from 'react-router-dom'
import { Formik } from 'formik'
import * as Yup from 'yup'

import Layout from '_app/layouts'
import {
  Loading,
  Stepper,
  Input,
  Checkbox,
  Button,
  toast,
} from '_components/index'

import { useAppDispatch, useInitializedGuard } from '_hooks'

import { createVault } from '_redux/slices/account'

import { ToS_LINK } from '_shared/constants'

import {
  passwordValidation,
  getConfirmPasswordValidation,
} from '_src/ui/utils/validation'

type Fields = {
  password: string
  confirmedPassword: string
  tos: boolean
}

const CreatePage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const initGuardLoading = useInitializedGuard(false)

  const onPrev = () => navigate('/welcome')

  const onSubmit = async (values: Fields) => {
    try {
      await dispatch(createVault({ password: values.password })).unwrap()
      navigate('/initialize/backup')
    } catch (err) {
      toast({
        type: 'error',
        message: `Failed to create vault, ${(err as Error)?.message}`,
        containerId: 'initialize-toast',
      })
    }
  }

  return (
    <Loading loading={initGuardLoading}>
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
                          href={ToS_LINK}
                          target="_blank"
                          rel="noreferrer"
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

export default CreatePage
