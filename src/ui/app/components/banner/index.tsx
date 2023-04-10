import { Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useQuery } from '@tanstack/react-query'

import 'swiper/css'
import 'swiper/css/autoplay'

type BannerData = {
  id: string
  link: string
  image: string
}

export const Banner = () => {
  const { isLoading, error, data } = useQuery<BannerData[]>({
    queryKey: ['bannerData'],
    queryFn: () =>
      fetch(`${process.env.COS_URL}/banner.json`).then((res) => res.json()),
  })

  if (isLoading || error || !data || !data?.length) {
    return null
  }

  return (
    <Swiper
      autoplay={{
        delay: 2000,
      }}
      className="mx-[-24px] mt-[-16px] mb-2 h-[218px]"
      loop
      modules={[Autoplay]}
      navigation
    >
      {data?.map((banner) => (
        <SwiperSlide key={banner.id}>
          <a
            className="block"
            href={banner.link}
            rel="noreferrer"
            target="_blank"
          >
            <img alt={banner.id} id="banner" src={banner.image} />
          </a>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
