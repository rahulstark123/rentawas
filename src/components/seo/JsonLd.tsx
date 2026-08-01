export default function JsonLd() {
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RentAwas",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "BusinessApplication",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "INR"
      },
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "499",
        "priceCurrency": "INR"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "1299",
        "priceCurrency": "INR"
      },
      {
        "@type": "Offer",
        "name": "Pro Plus Plan",
        "price": "3299",
        "priceCurrency": "INR"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1480",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "RentAwas is India's leading property management & rent collection software for landlords, PG owners & tenants. Automate 0% fee rent collection via GPay, PhonePe, Paytm, Razorpay & Stripe.",
    "featureList": [
      "0% Landlord Fee Rent Collection",
      "GPay, PhonePe & Paytm UPI Integration",
      "Razorpay, Stripe & PayPal Payment Gateways",
      "Automated Monthly Rent Receipts & Invoices",
      "Tenant Health Score Tracking",
      "Floor-by-Floor Unit & Room Matrix",
      "Maintenance Request & Expert Network Connection",
      "Net Operating Income (NOI) Analytics",
      "Multi-Currency & Global Payment Channels"
    ],
    "screenshot": "https://rentawas.com/hero-dashboard.png"
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "RentAwas",
    "url": "https://rentawas.com",
    "logo": "https://rentawas.com/rentawas%20logo.png",
    "description": "The ultimate rental ecosystem mission control software for landlords, PG owners, flat owners, and tenants.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9625727372",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://twitter.com/rentawas",
      "https://linkedin.com/company/rentawas",
      "https://facebook.com/rentawas"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "RentAwas",
    "url": "https://rentawas.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://rentawas.com/find-property?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
