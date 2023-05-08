import { useNavigate, useLocation } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { toB64, type ExportedKeypair } from '@mysten/sui.js'
import { hexToBytes } from '@noble/hashes/utils'

import Layout from '_app/layouts'
import { IconWrapper, Button, Input, toast } from '_app/components'

import { useBackgroundClient } from '_src/ui/app/hooks/useBackgroundClient'
import { passwordValidation } from '_src/ui/utils/validation'

import ArrowShort from '_assets/icons/arrow_short.svg'

type Fields = {
  privateKey: string
  password: string
}

const ImportPrivateKeyPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const backgroundClient = useBackgroundClient()

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
      privateKey: '',
      password: '',
    },
    validationSchema: Yup.object({
      privateKey: Yup.string()
        .ensure()
        .required('Private key is required')
        .trim()
        .transform((value: string) => {
          if (value.startsWith('0x')) {
            return value.substring(2)
          }
          return value
        })
        .test(
          'valid-hex',
          `\${path} must be a hexadecimal value. It may optionally begin with "0x".`,
          (value: string) => {
            try {
              hexToBytes(value)
              return true
            } catch (e) {
              return false
            }
          }
        )
        .test(
          'valid-bytes-length',
          `\${path} must be either 32 or 64 bytes.`,
          (value: string) => {
            try {
              const bytes = hexToBytes(value)
              return [32, 64].includes(bytes.length)
            } catch (e) {
              return false
            }
          }
        ),
      password: passwordValidation,
    }),
    onSubmit: async ({ privateKey, password }) => {
      try {
        const keyPair: ExportedKeypair = {
          schema: 'ED25519',
          privateKey: toB64(hexToBytes(privateKey)),
        }
        await backgroundClient.importPrivateKey(password, keyPair)

        navigate('/settings/general/wallet-management')
        setTimeout(() => {
          toast({
            type: 'success',
            message: 'Import private key successfully',
          })
        }, 100)
      } catch (e) {
        setFieldError(
          'privateKey',
          (e as Error)?.message || 'Failed to import private key'
        )
      }
    },
  })

  return (
    <Layout showNav={false}>
      <div className="flex flex-col grow font-medium px-6 pt-4 pb-6 overflow-hidden text-sm">
        <div className="mb-6 text-xl text-center font-bold relative">
          Import private key
          <span
            className="absolute left-0 top-[7px]"
            onClick={() => navigate(location.state?.nextPath || -1)}
          >
            <IconWrapper>
              <ArrowShort height={10} width={13} />
            </IconWrapper>
          </span>
        </div>
        <form className="flex flex-col grow w-full" onSubmit={handleSubmit}>
          <label className="text-[#7e7e7e]" htmlFor="privateKey">
            Private key
          </label>
          <textarea
            id="privateKey"
            name="privateKey"
            value={values.privateKey}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your private key"
            disabled={isSubmitting}
            className="h-[90px] w-full p-3.5 border border-[#7e7e7e] rounded-[15px] resize-none"
          />
          {touched?.privateKey && errors?.privateKey && (
            <p className="text-[#d74b4a] text-center">{errors?.privateKey}</p>
          )}
          <label className="mt-2 text-[#7e7e7e]" htmlFor="password">
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
          />
          <div className="flex flex-col grow justify-end h-24">
            <Button type="submit" className="w-full">
              Import
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default ImportPrivateKeyPage
