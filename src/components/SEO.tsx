import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ 
  title = 'Kaaram Kathalu | Artisanal Pickles & Podis', 
  description = 'Taste the heritage of Andhra with our hand-crafted, small-batch pickles and spices. Made with cold-pressed oils and sun-dried ingredients.',
  image = 'https://kaaramkathalu.com/og-image.jpg', // Placeholder
  url = 'https://kaaramkathalu.com'
}: SEOProps) {
  const siteTitle = title.includes('Kaaram Kathalu') ? title : `${title} | Kaaram Kathalu`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
