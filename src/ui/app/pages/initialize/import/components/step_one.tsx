import { Formik } from 'formik'
import * as Yup from 'yup'

import { Button } from '_app/components'

import { normalizeMnemonics, validateMnemonics } from '_src/shared/utils/bip39'

import type { MnemonicField } from '../types'

type StepOneProps = {
  mnemonic: string
  onSubmit: (values: MnemonicField) => void
}

const validationSchema = Yup.object({
  mnemonic: Yup.string()
    .ensure()
    .required('Recovery phrase is required')
    .trim()
    .transform((mnemonic) => normalizeMnemonics(mnemonic))
    .test('mnemonic-valid', 'Recovery Passphrase is invalid', (mnemonic) =>
      validateMnemonics(mnemonic)
    ),
})

const InitializeStepOne = ({ mnemonic, onSubmit }: StepOneProps) => (
  <Formik
    initialValues={{ mnemonic }}
    validationSchema={validationSchema}
    onSubmit={onSubmit}
    enableReinitialize={true}
  >
    {({
      touched,
      errors,
      values: { mnemonic },
      handleSubmit,
      handleChange,
      handleBlur,
      isSubmitting,
    }) => (
      <form className="flex flex-col grow w-full" onSubmit={handleSubmit}>
        <textarea
          id="mnemonic-textarea"
          name="mnemonic"
          value={mnemonic}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your 12-word recovery phrase"
          disabled={isSubmitting}
          className="h-[90px] w-full p-3.5 border border-[#7e7e7e] rounded-[15px] mb-2 resize-none"
        />
        {touched?.mnemonic && errors?.mnemonic && (
          <p className="text-[#d74b4a] text-center">{errors?.mnemonic}</p>
        )}
        <div className="flex flex-col grow justify-end h-24">
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </div>
      </form>
    )}
  </Formik>
)

export default InitializeStepOne
