import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Press_Start_2P } from 'next/font/google'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "MINI-PROJECT",
  description: "Team 13",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${pressStart2P.className} bg-[#111111]`}>
        {children}
      </body>
    </html>
  )
}
