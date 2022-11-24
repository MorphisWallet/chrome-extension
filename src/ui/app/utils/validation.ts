import * as Yup from 'yup'

export const passwordValidation = Yup.object({
  password: Yup.string().ensure().required('Password is required'),
})

export const getConfirmPasswordValidation = (passwordFieldName: string) =>
  Yup.string()
    .ensure()
    .required('Confirmed Password is required')
    .oneOf([Yup.ref(passwordFieldName)], 'Passwords must match')
