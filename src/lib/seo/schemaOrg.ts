const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://titantransfers.com'

export function generateTaxiServiceSchema(data: {
  name: string
  description: string
  url: string
  areaServed?: string
  rating?: number
  reviewCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: data.name,
    description: data.description,
    url: `${SITE_URL}${data.url}`,
    provider: {
      '@type': 'Organization',
      name: 'Titan Transfers',
      url: SITE_URL,
    },
    ...(data.areaServed && { areaServed: data.areaServed }),
    ...(data.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: data.rating,
        reviewCount: data.reviewCount || 500,
        bestRating: 5,
      },
    }),
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

export function generateFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}

export function generateBlogPostingSchema(post: {
  title: string
  description: string
  url: string
  image?: string
  publishDate: string
  modifiedDate?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}${post.url}`,
    ...(post.image && { image: post.image }),
    datePublished: post.publishDate,
    dateModified: post.modifiedDate || post.publishDate,
    author: {
      '@type': 'Organization',
      name: 'Titan Transfers',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Titan Transfers',
      url: SITE_URL,
    },
  }
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': SITE_URL,
    name: 'Titan Transfers',
    url: SITE_URL,
    description: 'Private airport transfers and taxi service worldwide. 100+ destinations, fixed prices, 24/7 support.',
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      reviewCount: 2500,
      bestRating: 5,
    },
  }
}
