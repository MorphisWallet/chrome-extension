// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  import { ReactElement, SVGProps } from 'react'
  const content: (props: SVGProps<SVGElement>) => ReactElement
  export default content
}
