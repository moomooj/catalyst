import React from 'react';

export default function JsonLd() {
  const businessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "The Catalyst Mobile Bar",
    "image": "https://catalystbar.ca/images/og-image.jpg",
    "@id": "https://catalystbar.ca",
    "url": "https://catalystbar.ca",
    "telephone": "", // 연락처가 있다면 여기에 추가
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "", // 사무실 주소가 있다면 추가
      "addressLocality": "Vancouver",
      "addressRegion": "BC",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 49.2827,
      "longitude": -123.1207
    },
    "servesCuisine": "Cocktails",
    "areaServed": [
      {
        "@type": "City",
        "name": "Vancouver"
      },
      {
        "@type": "City",
        "name": "Whistler"
      },
      {
        "@type": "City",
        "name": "Fraser Valley"
      }
    ],
    "description": "Premium mobile bar and professional bartending services for weddings, corporate events, and private parties in Vancouver and surrounding areas.",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  const serviceData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Mobile Bartending Service",
    "provider": {
      "@type": "LocalBusiness",
      "name": "The Catalyst Mobile Bar"
    },
    "areaServed": {
      "@type": "State",
      "name": "British Columbia"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Mobile Bar Packages",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Dry Hire Package"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "All Inclusive Package"
          }
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceData) }}
      />
    </>
  );
}
