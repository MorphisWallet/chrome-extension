import { createContext } from 'react'

type TabsStore = {
  currentValue: null | string | number
  onChange: (newValue: string | number) => void
}

export const TabsContext = createContext<TabsStore>({
  currentValue: null,
  onChange: () => null,
})
