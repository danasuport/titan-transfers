'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { russoOne } from '@/lib/fonts'

const starPaths = [
  'M51.7538 67.3504L54.7436 68.9755L53.7109 70.0167L50.7212 68.3916L51.7538 67.3504Z',
  'M61.4278 62.2359L60.2312 63.4424L59.5195 59.5168L60.7196 58.3068L61.4278 62.2359Z',
  'M63.4338 73.3231C63.5105 73.7312 63.357 74.0231 63.2175 74.192C63.0081 74.4417 62.7011 74.593 62.3907 74.593C62.2197 74.593 62.0488 74.5472 61.8848 74.4593L56.2751 71.4096L57.3077 70.3719L61.9371 72.887L60.8382 66.8087L62.0383 65.6021L63.4338 73.3231Z',
  'M77.2732 30.3881L58.8741 48.0954L60.1126 54.9405L58.9125 56.1505L57.6357 49.0944L57.367 47.5994L58.4555 46.5512L75.8079 29.8534L52.0329 26.6243L50.5433 26.4203L49.8909 25.0555L39.4983 3.25375L29.1092 25.0555L28.4568 26.4203L26.9636 26.6243L3.19213 29.8534L20.5446 46.5512L21.633 47.5994L21.3609 49.0944L17.0594 72.887L38.1761 61.4093L39.4983 60.6882L40.824 61.4093L49.1862 65.9575L48.1571 66.9951L39.4983 62.2887L17.1118 74.4593C16.9478 74.5473 16.7769 74.593 16.6059 74.593C16.2989 74.593 15.9884 74.4418 15.7826 74.192C15.6396 74.0232 15.4895 73.7312 15.5628 73.3232L20.1224 48.0954L1.72691 30.3881C1.29083 29.966 1.38851 29.4735 1.44782 29.28C1.51061 29.0901 1.71993 28.6328 2.31649 28.5519L27.5253 25.1293L38.5424 2.01558C38.8041 1.46684 39.2994 1.40704 39.4983 1.40704C39.6971 1.40704 40.196 1.46684 40.4577 2.01558L51.4748 25.1293L76.6801 28.5519C77.2767 28.6328 77.486 29.0901 77.5488 29.28C77.6116 29.4735 77.7092 29.966 77.2732 30.3881Z',
  'M51.7536 67.3504L49.6918 69.4292L52.6815 71.0543L54.7433 68.9755L51.7536 67.3504ZM61.9194 57.0967L59.5193 59.5168L60.2309 63.4424L61.4275 62.2359L62.6311 61.0223L61.9194 57.0967ZM64.808 73.0699L63.2381 64.3886L62.038 65.6021L60.838 66.8087L61.9369 72.887L57.3075 70.3719L56.2748 71.4096L55.2492 72.4473L61.2252 75.6975C61.6055 75.905 62.0032 76 62.3904 76C63.8312 76 65.1011 74.6844 64.808 73.0699ZM76.8647 27.1554L52.4059 23.8349L41.7133 1.40702C41.2667 0.467833 40.3841 0 39.498 0C38.6119 0 37.7293 0.467833 37.2827 1.40702L26.5936 23.8349L2.13131 27.1554C0.0904576 27.4333 -0.72937 29.9695 0.763763 31.4046L18.6151 48.5878L14.188 73.0699C13.8985 74.6844 15.1683 76 16.6056 76C16.9929 76 17.3906 75.905 17.7743 75.6975L39.498 63.8856L47.1276 68.0328L48.1568 66.9951L49.1859 65.9574L40.8237 61.4092L39.498 60.6881L38.1758 61.4092L17.0592 72.887L21.3606 49.0943L21.6327 47.5994L20.5443 46.5511L3.19185 29.8534L26.9634 26.6243L28.4565 26.4203L29.1089 25.0555L39.498 3.25373L49.8906 25.0555L50.543 26.4203L52.0327 26.6243L75.8077 29.8534L58.4552 46.5511L57.3668 47.5994L57.6354 49.0943L58.9122 56.1505L61.3124 53.7304L60.3809 48.5878L78.2357 31.4046C79.7254 29.9695 78.9091 27.4333 76.8647 27.1554Z',
]

function StarFull({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 79 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      {starPaths.map((d, i) => <path key={i} d={d} fill="#8BAA1D" />)}
    </svg>
  )
}

function StarPartial({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 79 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sp" x1="0" y1="0" x2="79" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="80%" stopColor="#8BAA1D" />
          <stop offset="80%" stopColor="#374151" />
        </linearGradient>
      </defs>
      {starPaths.map((d, i) => <path key={i} d={d} fill="url(#sp)" />)}
    </svg>
  )
}

export function HeroSection() {
  const t = useTranslations('home')

  return (
    <section className="mob-stack" style={{ background: '#F8FAF0', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '580px' }}>

      {/* Left: text */}
      <div
        className="flex flex-col justify-center py-16"
        style={{ paddingLeft: '6vw', paddingRight: '4vw' }}
      >
        <h1
          className={`${russoOne.className} mb-6`}
          style={{ fontSize: '5rem', lineHeight: 1.05, color: '#242426' }}
        >
          {t('heroTitle')}
        </h1>

        <p className="mb-10 leading-relaxed text-gray-500" style={{ fontSize: '24px' }}>
          {t('heroSubtitle')}
        </p>

        <div className="mb-10">
          <div className="flex gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, i) => <StarFull key={i} size={64} />)}
            <StarPartial size={64} />
          </div>
          <p className="text-gray-600" style={{ fontSize: '24px' }}>
            {t('heroRating')}{' '}
            <span
              className={`${russoOne.className} underline`}
              style={{ color: '#8BAA1D', fontSize: '24px' }}
            >
              4.8
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href="#" className="transition-opacity hover:opacity-80">
            <Image src="/app-store-btn.png" alt="Download on the App Store" width={160} height={48} className="h-12 w-auto" />
          </a>
          <a href="#" className="transition-opacity hover:opacity-80">
            <Image src="/play-store-btn.png" alt="Get it on Google Play" width={160} height={48} className="h-12 w-auto" />
          </a>
        </div>
      </div>

      {/* Right: image with diagonal left mask */}
      <div
        className="mob-img-panel"
        style={{
          position: 'relative',
          clipPath: 'polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      >
        <Image
          src="/hero-car.png"
          alt="Vehículo de traslado privado de lujo"
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
          quality={90}
        />
      </div>

    </section>
  )
}
