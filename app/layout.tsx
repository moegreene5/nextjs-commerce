import "./globals.css";

import Footer from "@/components/footer";
import type { Metadata } from "next";
import {
  Albert_Sans,
  Alegreya,
  Geologica,
  Josefin_Sans,
  Lato,
  Open_Sans,
  Playfair_Display,
  Raleway,
} from "next/font/google";

export const metadata: Metadata = {
  title: {
    default: "Next 16 Products App Commerce",
    template: "%s | Next 16 Products App Commerce",
  },
  description: "Next.js 16 App Router Products App Commerce",
};

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--raleway",
});

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--alegreya",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--open-sans",
});
const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--albert-sans",
});
const PlayfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--playfair-display",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--josefin-sans",
});

const geologica = Geologica({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--geologica",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--lato_font",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${raleway.className} ${alegreya.variable} ${raleway.variable} ${lato.variable} ${openSans.variable} ${albertSans.variable} ${PlayfairDisplay.variable} ${josefinSans.variable} ${geologica.variable}`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
