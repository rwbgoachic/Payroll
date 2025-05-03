import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'PaySurity - Modern Payroll Software for Businesses',
  description = 'PaySurity delivers affordable payroll services with automated tax compliance for SMBs and global teams.',
  keywords = [
    'payroll software',
    'automated tax compliance',
    'small business payroll',
    'global payroll solutions',
    'affordable payroll services'
  ],
  ogImage = 'https://payroll.paysurity.com/og-image.jpg',
  ogType = 'website',
  canonical
}) => {
  const siteUrl = 'https://payroll.paysurity.com';
  const fullTitle = title.includes('PaySurity') ? title : `${title} | PaySurity`;

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
      <meta property="og:url" content={canonical || siteUrl} />
      <meta property="og:site_name" content="PaySurity" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'PaySurity',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          description,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;