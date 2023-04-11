import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  hasPublicTransfer,
  getTransactionDigest,
  TransactionBlock,
} from '@mysten/sui.js'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Input, Button, TxLink, toast } from '_app/components'

import { useActiveAddress, useOwnedNFT, useSigner } from '_hooks'

import { suiAddressValidation } from '_src/ui/utils/validation'
import { getSignerOperationErrorMessage } from '_src/ui/app/helpers/errorMessages'
import { ExplorerLinkType } from '_src/ui/app/components/tx_link/types'

type Fields = {
  address: string
}

const NftSend = () => {
  const navigate = useNavigate()
  const { objectId = '' } = useParams()
  const signer = useSigner()
  const queryClient = useQueryClient()
  const address = useActiveAddress()
  const { data: ownedNFT, isLoading } = useOwnedNFT(objectId || '', address)
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
  } = useFormik<Fields>({
    initialValues: {
      address: '',
    },
    validationSchema: Yup.object().shape({
      address: suiAddressValidation,
    }),
    onSubmit: async ({ address }) => {
      if (!objectId || !address) {
        return
      }

      await transferNFT.mutateAsync(address)
    },
  })

  const transferNFT = useMutation({
    mutationFn: async (to: string) => {
      if (!to || !signer) {
        throw new Error('Missing data')
      }
      const tx = new TransactionBlock()
      tx.transferObjects([tx.object(objectId)], tx.pure(to))

      return signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
        },
      })
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(['object', objectId])
      queryClient.invalidateQueries(['objects-owned'])
      const digest = getTransactionDigest(response)
      navigate('/nft')
      setTimeout(() => {
        toast({
          type: 'success',
          message: (
            <p>
              {`Successfully transferred NFT ${objectId} to ${address} `}
              <TxLink
                transactionID={digest}
                type={ExplorerLinkType.transaction}
              >
                View on explorer
              </TxLink>
            </p>
          ),
        })
      }, 0)
    },
    onError: (error) => {
      toast({
        type: 'error',
        message: getSignerOperationErrorMessage(error),
      })
    },
  })

  if (ownedNFT && objectId && hasPublicTransfer(ownedNFT)) {
    return <Navigate to="/" replace />
  }

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
        <Button type="submit" loading={isSubmitting} disabled={isLoading}>
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
