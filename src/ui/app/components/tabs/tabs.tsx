import { useEffect, useRef, useState } from 'react'
import cl from 'classnames'

import { TabsContext } from './tab_context'

type TabsProps = {
  value: string | number
  onChange: (newValue: string | number) => void
  children: React.ReactNode | React.ReactNode[]
  classNames?: string
}

export const Tabs = ({ value, onChange, classNames, children }: TabsProps) => {
  const tabContainer = useRef<HTMLDivElement>(null)

  const [sliderWidth, setSliderWidth] = useState(0)
  const [sliderOffset, setSliderOffset] = useState(0)

  const calculateSlideWidthAndOffset = () => {
    if (!value) return

    const tabDom = tabContainer?.current
    if (!tabDom) return

    const tabs = Array.from(tabDom.children).filter((_tab) => {
      const dataValue = _tab.getAttribute('data-value')
      return dataValue !== undefined && dataValue !== null
    })
    const currentTabIndex = tabs.findIndex(
      (_tab) => _tab.getAttribute('data-value') === value
    )

    if (currentTabIndex < 0) {
      setSliderWidth(0)
      setSliderOffset(0)
      return
    }

    setSliderWidth(tabs[currentTabIndex].clientWidth)
    setSliderOffset(
      tabs
        .filter((_, index) => index < currentTabIndex)
        .reduce((acc, _tab) => acc + _tab.clientWidth, 0)
    )
  }

  useEffect(() => {
    calculateSlideWidthAndOffset()
  }, [tabContainer, value])

  return (
    <TabsContext.Provider value={{ currentValue: value, onChange }}>
      <div
        ref={tabContainer}
        className={cl([
          'flex border-b border-b-[#e7e9e9] text-base relative',
          classNames,
        ])}
      >
        <div
          className={cl([
            'absolute bottom-0 left-0 border-b border-b-black transition translate-x-0',
          ])}
          style={{
            width: `${sliderWidth}px`,
            transform: `translateX(${sliderOffset}px)`,
          }}
        />
        {children}
      </div>
    </TabsContext.Provider>
  )
}
