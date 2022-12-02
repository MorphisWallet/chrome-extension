import { Formik } from 'formik'
import * as Yup from 'yup'

import { Input, Button } from '_app/components'

import {
  passwordValidation,
  getConfirmPasswordValidation,
} from '_app/utils/validation'

import { PasswordField } from '../type'

type StepTwoProps = {
  onBack: () => void
  onSubmit: (values: PasswordField) => void
}

export const StepTwo = ({ onBack, onSubmit }: StepTwoProps) => {
  return (
    <Formik
      initialValues={{
        password: '',
        confirmPassword: '',
      }}
      validationSchema={Yup.object().shape({
        password: passwordValidation,
        confirmPassword: getConfirmPasswordValidation('password'),
      })}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({
        touched,
        errors,
        values,
        handleSubmit,
        handleChange,
        handleBlur,
        isSubmitting,
      }) => (
        <form className="flex flex-col grow w-full" onSubmit={handleSubmit}>
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
              id="confirmPassword"
              name="confirmPassword"
              value={values.confirmPassword}
              error={touched.confirmPassword && errors.confirmPassword}
              type="password"
              placeholder="Confirm password"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="grow" />
          </fieldset>
          <div className="flex gap-2.5">
            <Button type="button" variant="outlined" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" variant="contained">
              Import
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
