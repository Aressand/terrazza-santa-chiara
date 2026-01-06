export function getLodgingBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Terrazza Santa Chiara',
    description: 'Charming B&B in the heart of Assisi, just 30 meters from Basilica di Santa Chiara',
    url: 'https://terrazzasantachiara.com',
    telephone: '+39 XXX XXX XXXX',
    email: 'info@terrazzasantachiara.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Via Santa Chiara',
      addressLocality: 'Assisi',
      addressRegion: 'Umbria',
      postalCode: '06081',
      addressCountry: 'IT'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.0707,
      longitude: 12.6156
    },
    image: 'https://terrazzasantachiara.com/images/garden-room.jpg',
    priceRange: '€80 - €150',
    starRating: {
      '@type': 'Rating',
      ratingValue: '4'
    },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Free WiFi' },
      { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning' },
      { '@type': 'LocationFeatureSpecification', name: 'Private Terrace' },
      { '@type': 'LocationFeatureSpecification', name: 'Historic Building' },
      { '@type': 'LocationFeatureSpecification', name: 'Kitchen' }
    ],
    hasMap: 'https://maps.google.com/?q=Terrazza+Santa+Chiara+Assisi'
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where is Terrazza Santa Chiara located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Terrazza Santa Chiara is a charming B&B located in the historic center of Assisi, Umbria, Italy. It is situated just 30 meters from the Basilica di Santa Chiara, offering guests an authentic experience in the heart of medieval Assisi.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does a room cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Room prices at Terrazza Santa Chiara start from €70 per night. The Garden Room and Terrace Apartment start from €70, while the Stone Vault Apartment and Contemporary Luxury Apartment start from €90 per night. Prices vary depending on the season and length of stay.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the check-in and check-out time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Check-in is from 3:00 PM and check-out is by 11:00 AM. Early check-in or late check-out may be available upon request, subject to availability.'
        }
      },
      {
        '@type': 'Question',
        name: 'How far is Terrazza Santa Chiara from Basilica di Santa Chiara?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Terrazza Santa Chiara is located just 30 meters from the Basilica di Santa Chiara, making it one of the closest accommodations to this important religious site in Assisi.'
        }
      },
      {
        '@type': 'Question',
        name: 'How far is Terrazza Santa Chiara from Basilica di San Francesco?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Basilica di San Francesco is approximately a 10-minute walk from Terrazza Santa Chiara through the charming streets of historic Assisi.'
        }
      },
      {
        '@type': 'Question',
        name: 'How far is Terrazza Santa Chiara from the Sanctuary of Carlo Acutis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Sanctuary of Carlo Acutis (Santuario della Spogliazione at Vescovado) is just a 4-minute walk from Terrazza Santa Chiara, making it easily accessible for pilgrims visiting this important spiritual site.'
        }
      }
    ]
  };
}
