import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ 
  title = 'Shop Authentic Andhra Delicacies: Pickles, Sprinkle & Podis – Manduva', 
  description = 'Explore our exquisite range of handcrafted pickles, sprinkle, and podis, made with authentic Andhra recipes, crafted by locals. Our organic products, richness with zero preservatives, bring you the true essence of Andhra Pradesh. Shop now!',
  image = 'https://themanduvaproject.in/cdn/shop/files/Manduva.png?v=1706617092',
  url = 'https://themanduvaproject.in'
}: SEOProps) {
  const siteTitle = title.includes('Manduva') ? title : `${title} | Manduva`;

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
