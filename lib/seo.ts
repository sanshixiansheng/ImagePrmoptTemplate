import { Metadata } from 'next'

/**
 * SEO閰嶇疆鎺ュ彛
 */
interface SEOConfig {
  title: string
  description: string
  keywords?: string
  locale: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
}

/**
 * 鐢熸垚椤甸潰Metadata锛堝寘鍚玂G銆乀witter Card绛夛級
 */
export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    locale,
    path,
    image = '/og-image.jpg',
    type = 'website',
    publishedTime,
    modifiedTime,
  } = config

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || ''
  const url = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}${path}`
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Visora' }],
    creator: 'Visora',
    publisher: 'Visora',

    // Open Graph
    openGraph: {
      type,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url,
      title,
      description,
      siteName: 'Visora',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@imagetoprompt',
    },

    // Canonical URL
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': `${baseUrl}/zh${path}`,
        'en-US': `${baseUrl}${path}`,
      },
    },

    // 鍏朵粬鍏冩暟鎹?
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification (鍙€夛紝娣诲姞浣犵殑楠岃瘉鐮?
    // verification: {
    //   google: 'your-google-verification-code',
    //   yandex: 'your-yandex-verification-code',
    //   bing: 'your-bing-verification-code',
    // },
  }
}

/**
 * 鐢熸垚 Schema.org 缁勭粐缁撴瀯鍖栨暟鎹?
 */
export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || ''

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Visora',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Professional AI image generation and analysis platform with image-to-prompt and text-to-image capabilities',
    sameAs: [
      // 娣诲姞浣犵殑绀句氦濯掍綋閾炬帴
      // 'https://twitter.com/yourprofile',
      // 'https://facebook.com/yourprofile',
      // 'https://linkedin.com/company/yourprofile',
    ],
  }
}

/**
 * 鐢熸垚 Schema.org 浜у搧缁撴瀯鍖栨暟鎹?
 */
export function generateProductSchema(product: {
  name: string
  description: string
  image: string
  price?: number
  currency?: string
  rating?: number
  reviewCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency || 'USD',
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
  }
}

/**
 * 鐢熸垚 Schema.org 鏂囩珷缁撴瀯鍖栨暟鎹?
 */
export function generateArticleSchema(article: {
  title: string
  description: string
  image: string
  publishedTime: string
  modifiedTime?: string
  author: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || ''

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Visora',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  }
}

/**
 * 鐢熸垚 Schema.org 闈㈠寘灞戝鑸粨鏋勫寲鏁版嵁
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || ''

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

/**
 * 鐢熸垚 Schema.org FAQ 缁撴瀯鍖栨暟鎹?
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * 鐢熸垚 Schema.org 瑙嗛缁撴瀯鍖栨暟鎹?
 */
export function generateVideoSchema(video: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  contentUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    ...(video.duration && { duration: video.duration }),
    ...(video.contentUrl && { contentUrl: video.contentUrl }),
  }
}

