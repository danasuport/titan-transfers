import { useTranslations } from 'next-intl'
import { BookingWidget } from './BookingWidget'

type PageContext =
  | { type: 'airport'; airportName: string; etoFromLocation?: string; etoFromCategory?: string }
  | { type: 'route'; originName: string; destinationName: string; etoFromLocation?: string; etoFromCategory?: string; etoToLocation?: string; etoToCategory?: string }
  | { type: 'city'; cityName: string; etoToLocation?: string; etoToCategory?: string }
  | { type: 'country'; countryName: string }
  | { type: 'region'; regionName: string }
  | { type: 'service'; serviceName: string }
  | { type: 'blog'; cityName?: string; airportName?: string; etoToLocation?: string; etoToCategory?: string }

export function BookingWidgetWrapper({ context }: { context: PageContext }) {
  const t = useTranslations()

  let title = ''
  let fromLocation: string | undefined
  let fromCategory: string | undefined
  let toLocation: string | undefined
  let toCategory: string | undefined

  switch (context.type) {
    case 'airport':
      title = t('airport.bookTransfer', { airport: context.airportName })
      fromLocation = context.etoFromLocation
      fromCategory = context.etoFromCategory
      break
    case 'route':
      title = t('route.bookTransfer', { destination: context.destinationName })
      fromLocation = context.etoFromLocation
      fromCategory = context.etoFromCategory
      toLocation = context.etoToLocation
      toCategory = context.etoToCategory
      break
    case 'city':
      title = t('city.bookTransfer', { city: context.cityName })
      toLocation = context.etoToLocation
      toCategory = context.etoToCategory
      break
    case 'country':
      title = t('country.bookTransfer', { country: context.countryName })
      break
    case 'region':
      title = t('region.bookTransfer', { region: context.regionName })
      break
    case 'service':
      title = t('service.bookTransfer', { service: context.serviceName })
      break
    case 'blog':
      title = context.cityName
        ? t('city.bookTransfer', { city: context.cityName })
        : t('home.bookYourTransfer')
      toLocation = context.etoToLocation
      toCategory = context.etoToCategory
      break
  }

  return (
    <BookingWidget
      title={title}
      fromLocation={fromLocation}
      fromCategory={fromCategory}
      toLocation={toLocation}
      toCategory={toCategory}
    />
  )
}
