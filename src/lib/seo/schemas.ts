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
        name: 'How far is Terrazza Santa Chiara from the Basilica?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Terrazza Santa Chiara is located just 30 meters from the Basilica di Santa Chiara in Assisi, in the heart of the historic center.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the check-in and check-out time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Check-in is from 3:00 PM and check-out is by 11:00 AM. Early check-in or late check-out may be available upon request.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does a room cost at Terrazza Santa Chiara?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Room prices at Terrazza Santa Chiara range from €80 to €150 per night, depending on the room type and season. The Garden Room starts at €80, while the Panoramic Terrace Apartment is €150 per night.'
        }
      },
      {
        '@type': 'Question',
        name: 'What amenities are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All rooms feature free WiFi, air conditioning, luxury linens, and modern amenities. Some rooms include full kitchens, private terraces, and historic 13th-century architecture.'
        }
      }
    ]
  };
}
