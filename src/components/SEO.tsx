import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
  type?: 'website' | 'product' | 'article';
}

export default function SEO({
  title = 'Authentic Andhra Pickles, Podis & Spice Blends',
  description = 'Kaaram Kathalu brings you handcrafted Andhra pickles (avakaya, gongura) and traditional spice podis made by local artisans using heritage recipes. Free shipping on orders above ₹999.',
  image = 'https://www.kaaramkathalu.in/logo.jpg',
  url = 'https://www.kaaramkathalu.in',
  keywords = 'andhra pickles online, avakaya pickle, gongura pickle, spice podi, kaaram kathalu, artisan pickles india, heritage pickle brands, buy pickles online india, spice powders online',
  type = 'website',
}: SEOProps) {
  const siteTitle = title.includes('Kaaram Kathalu') ? title : `${title} | Kaaram Kathalu`;

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* ── Open Graph ── */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Kaaram Kathalu" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
