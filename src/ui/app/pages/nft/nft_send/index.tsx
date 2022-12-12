import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import { Input, Button, TxLink, toast } from '_app/components'

import { useAppDispatch } from '_hooks'

import { transferNFT } from '_redux/slices/sui-objects'

import { suiAddressValidation } from '_app/utils/validation'

import type { SerializedError } from '@reduxjs/toolkit'
import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'

const NftSend = () => {
  const navigate = useNavigate()
  const { objectId: nftId = '' } = useParams()
  const dispatch = useAppDispatch()
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
    onSubmit: async ({ address }) => {
      if (!nftId) {
        return
      }

      try {
        const resp = await dispatch(
          transferNFT({
            recipientAddress: address,
            nftId: nftId,
          })
        ).unwrap()

        if (resp?.txId) {
          navigate('/nft')

          setTimeout(() => {
            toast({
              type: 'success',
              message: (
                <p>
                  Successfully sent NFT
                  {'. '}
                  <TxLink
                    type={ExplorerLinkType.object}
                    objectID={nftId}
                    className="flex shrink text-[#6bb7e9] truncate"
                  >
                    View on explorer
                  </TxLink>
                </p>
              ),
            })
          }, 0)
        }
      } catch (e) {
        toast({
          type: 'error',
          message: (e as SerializedError).message || null,
        })
      }
    },
  })

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="address">Address</label>
      <Input
        id="address"
        name="address"
        className="mb-3.5"
        inputClassName="px-4 rounded-[4px] mb-0"
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
