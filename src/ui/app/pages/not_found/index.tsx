import { Link } from 'react-router-dom'

import Layout from '_app/layouts'
import { Button } from '_app/components'

const NotFound = () => (
  <Layout showHeader={false} showNav={false}>
    <div className="flex flex-col grow justify-center items-center p-6">
      <p className="text-4xl mb-3">Page not found</p>
      <Link to="/" className="w-full">
        <Button>Back to home</Button>
      </Link>
    </div>
  </Layout>
)

export default NotFound
