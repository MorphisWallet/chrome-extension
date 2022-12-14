import { useFormik } from 'formik'
import * as Yup from 'yup'

import { Button, Input, Checkbox } from '_app/components'

import { useAppDispatch } from '_hooks'

import { unlockWallet } from '_redux/slices/wallet'

import { passwordValidation } from '_app/utils/validation'

type ConfirmModalProps = {
  warnings: string
  checkboxText: string
  onSuccess: () => void
}

type Fields = {
  password: string
  agreement: boolean
}

const Confirm = ({ warnings, checkboxText, onSuccess }: ConfirmModalProps) => {
  const dispatch = useAppDispatch()

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
        await dispatch(unlockWallet({ password })).unwrap()
        onSuccess()
      } catch (e) {
        setFieldError('password', (e as Error).message || 'Incorrect password')
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
      <Button loading={isSubmitting}>Confirm</Button>
    </form>
  )
}

export default Confirm
