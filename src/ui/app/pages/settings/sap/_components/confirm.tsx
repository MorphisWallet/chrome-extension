import { useFormik } from 'formik'
import * as Yup from 'yup'

import { Button, Input, Checkbox } from '_app/components'

import { useBackgroundClient } from '_src/ui/app/hooks/useBackgroundClient'

import { passwordValidation } from '_src/ui/utils/validation'

type ConfirmModalProps = {
  warnings: string
  checkboxText: string
  onSuccess: (password: string) => unknown | Promise<unknown>
}

type Fields = {
  password: string
  agreement: boolean
}

const Confirm = ({ warnings, checkboxText, onSuccess }: ConfirmModalProps) => {
  const backgroundService = useBackgroundClient()

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
    setFieldError,
  } = useFormik<Fields>({
    initialValues: {
      password: '',
      agreement: false,
    },
    validationSchema: Yup.object().shape({
      password: passwordValidation,
      agreement: Yup.boolean().required().oneOf([true]),
    }),
    onSubmit: async ({ password }) => {
      try {
        await backgroundService.verifyPassword(password)
        await onSuccess(password)
      } catch (e) {
        setFieldError('password', (e as Error)?.message || 'Incorrect password')
      }
    },
  })

  return (
    <form className="flex flex-col grow" onSubmit={handleSubmit}>
      <p className="mb-12 text-sm">{warnings}</p>
      <div className="flex flex-col grow justify-center">
        <label htmlFor="password" className="mb-2">
          Password
        </label>
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
        <Checkbox
          id="agreement"
          name="agreement"
          checked={values.agreement}
          onChange={handleChange}
          className="mb-4 !items-start"
          inputClassName="mt-0.5"
          error={touched.agreement && !!errors.agreement}
          label={checkboxText}
        />
      </div>
      <div className="grow" />
      <Button type="submit" loading={isSubmitting}>
        Confirm
      </Button>
    </form>
  )
}

export default Confirm
