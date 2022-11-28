import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, FieldArray } from 'formik'
import * as Yup from 'yup'

import { Stepper, Button, Input } from '_components/index'

import { MNEMONIC_LENGTH } from '_src/shared/constants'

type StepOneProps = {
  mnemonic: string | null
  setStep: (args: 0 | 1) => void
}

type MnemonicField = {
  phrases: string[]
}

export const StepTwo = ({ mnemonic, setStep }: StepOneProps) => {
  const navigate = useNavigate()

  const [error, setError] = useState<string | null>(null)

  const onSubmit = (values: MnemonicField) => {
    if (values.phrases.map((v) => v.trim()).join(' ') !== mnemonic) {
      setError('Incorrect mnemonic')
      return
    }

    navigate('/')
  }

  const onPaste = (
    e: React.ClipboardEvent<HTMLFieldSetElement>,
    setValues: (
      values: React.SetStateAction<MnemonicField>,
      shouldValidate?: boolean
    ) => void
  ) => {
    e.preventDefault()

    const paste = (e.clipboardData || window.clipboardData).getData('text')
    if (typeof paste !== 'string') return

    const pasteArray = paste.split(' ')
    // use macro task to let copy run first and setValues secondly
    setTimeout(() => {
      setValues({
        phrases:
          pasteArray.length < MNEMONIC_LENGTH
            ? [
                ...pasteArray,
                ...Array(MNEMONIC_LENGTH - pasteArray.length).fill(''),
              ]
            : pasteArray.slice(0, 12),
      })
    }, 0)
  }

  return (
    <div className="flex flex-col grow px-10 pb-10">
      <Stepper steps={3} current={2} onPrev={() => setStep(0)} />
      <Formik
        initialValues={{ phrases: Array(MNEMONIC_LENGTH).fill('') }}
        validationSchema={Yup.object().shape({
          phrases: Yup.array().of(Yup.string().min(1).required()),
        })}
        onSubmit={onSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setValues,
        }) => (
          <form
            id="confirm-form"
            onSubmit={handleSubmit}
            className="flex flex-col justify-center grow font-medium"
            onChange={() => setError(null)}
          >
            <div className="flex flex-col grow justify-center">
              <p className="text-2xl mb-3">Confirm your recovery phrase</p>
              <p className="text-lg text-[#929294] leading-6 mb-12">
                Enter your recovery phrase
              </p>
              <FieldArray name="phrases">
                {() => (
                  <fieldset
                    className="grid grid-cols-3 grid-rows-4 mb-2.5 gap-x-2 gap-y-4"
                    onPaste={(e) => onPaste(e, setValues)}
                  >
                    {Array(MNEMONIC_LENGTH)
                      .fill(null)
                      .map((_, i) => (
                        <Input
                          key={i}
                          name={`phrases.${i}`}
                          value={values.phrases[i]}
                          error={touched.phrases && !!errors.phrases?.[i]}
                          placeholder={String(i + 1).padStart(2, '0')}
                          onChange={handleChange}
                          inputClassName="h-7 border-[#c8c8c8] rounded-[30px] px-2 text-xs placeholder:text-xs"
                        />
                      ))}
                  </fieldset>
                )}
              </FieldArray>
            </div>
            <p className="text-center text-[#D74B4A] h-6">{error}</p>
            <Button form="confirm-form" type="submit">
              Confirm
            </Button>
          </form>
        )}
      </Formik>
    </div>
  )
}
