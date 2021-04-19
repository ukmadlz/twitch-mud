import React from 'react';
import Head from 'next/head';

/**
 * Header for the site
 *
 * @returns {Head} The complete head
 */
export default function HeadComponent() {
  const webMonetisationToken = '$ilp.uphold.com/rYJjQZggnQQ6';
  return (
    <Head>
      <meta name="monetization" content={webMonetisationToken} />
    </Head>
  );
}
