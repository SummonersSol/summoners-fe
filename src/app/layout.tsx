import Layout from '@/components/Layout';
import React from 'react';
import './globals.css'
import type { Metadata } from 'next';
import { Inter, Exo_2, Nanum_Brush_Script } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import Header from '@/components/Header';

const exo2 = Exo_2({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL("https://summoners.kidas.app"),
  title: 'summoners',
  description: 'Learn how to develop on Solana the fun way',
  keywords: "summoners, pvp",
  openGraph: {
    title: "summoners",
    description: "PVP App",
    images: [
        {
          url: 'https://summoners.kidas.app/opengraph-image.png',
          width: 1015,
          height: 351,
          alt: 'summoners Logo',
          type: 'image/png',
        },
    ],
    siteName: "summoners",
    url: "https://summoners.kidas.app",
    type: "website",
  },
  twitter: {
    site: '@placeholder',
    title: "summoners",
    description: "summoners",
    images: [
      {
        url: 'https://summoners.kidas.app/twitter-image.png',
        width: 1015,
        height: 351,
        alt: 'summoners Logo',
        type: 'image/png',
      },
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='dark'>
      <Head>
        <link
          rel="canonical"
          href="https://summoners.kidas.app"
          key="canonical"
        />
      </Head>
      <body className={`
        ${exo2.className} 
        flex flex-row
      `}>
          <Layout>
            {children}

            <ToastContainer
              position="bottom-left"
              autoClose={3000}
              hideProgressBar={true}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnHover={false}
              theme={'colored'}
            />
          </Layout>
      </body>
    </html>
  )
}
