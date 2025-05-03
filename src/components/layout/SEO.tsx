import React from 'react';
import { Helmet } from 'react-helmet-async';
import { siteConfig } from '../../config/siteConfig';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  structuredData?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = siteConfig.seo.defaultDescription,
  keywords = siteConfig.seo.defaultKeywords,
  ogImage = siteConfig.ogImage,
  ogType = 'website',
  canonical,
  structuredData
}) => {
  const siteUrl = siteConfig.url;
  const fullTitle = title 
    ? `${title} | ${siteConfig.name}`
    : siteConfig.seo.defaultTitle;
  
  const canonicalUrl = canonical 
    ? `${siteUrl}${canonical}` 
    : siteUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteConfig.name} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Default Structured Data for PaySurity Payroll */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: siteConfig.name,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description: description,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          publisher: {
            '@type': 'Organization',
            name: 'PaySurity',
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/logo.png`
            }
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1024'
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;