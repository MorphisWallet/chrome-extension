import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import { Input, Button } from '_app/components'

import { suiAddressValidation } from '_app/utils/validation'

const NftSend = () => {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
  } = useFormik({
    initialValues: {
      address: '',
    },
    validationSchema: Yup.object().shape({
      address: suiAddressValidation,
    }),
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2))
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="address">Address</label>
      <Input
        id="address"
        name="address"
        className="mb-3.5"
        inputClassName="rounded-[4px] mb-0"
        disabled={isSubmitting}
        value={values.address}
        error={touched.address && errors.address}
        placeholder="Address or SUI name"
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <div className="flex gap-2">
        <Button type="submit" loading={isSubmitting}>
          Send
        </Button>
        <Link to="../" className="w-full">
          <Button variant="outlined">Cancel</Button>
        </Link>
      </div>
    </form>
  )
}

export default NftSend
