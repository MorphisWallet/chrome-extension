import { useEffect } from 'react'

const BANNER_IMAGE_COS_URL =
  'https://morphis-1256253626.cos.accelerate.myqcloud.com/banner.png'

export const Banner = () => {
  useEffect(() => {
    const img = document.getElementById('banner')
    if (!img) return

    img.onerror = function () {
      this.style.display = 'none'
    }
  }, [])

  return (
    <a
      className="block mx-[-24px]"
      href="https://clutchy.io/launchpad/SUIDinosNFT"
      rel="noreferrer"
      target="_blank"
    >
      <img
        alt=""
        className="mt-[-16px] mb-2"
        id="banner"
        src={BANNER_IMAGE_COS_URL}
      />
    </a>
  )
}
