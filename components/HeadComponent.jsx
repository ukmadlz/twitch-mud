import React from 'react';
import Head from 'next/head';

/**
 * Header for the site
 *
 * @returns The complete head
 */
export default function HeadComponent() {
  return (
    <Head>
      <meta name="monetization" content={process.env.WEB_MONETISATION_TOKEN} />
    </Head>
  );
}
