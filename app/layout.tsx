import "./globals.css";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { getIsAuthenticated } from "@/features/auth/auth-queries";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import Providers from "@/hooks/query-client-provider";
import type { Metadata } from "next";
import { Geologica, Playfair_Display, Raleway } from "next/font/google";
import { Toaster } from "sonner";

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

const PlayfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--playfair-display",
});

const geologica = Geologica({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--geologica",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = getIsAuthenticated();

  return (
    <html lang="en">
      <body
        className={`${raleway.className} ${raleway.variable}  ${PlayfairDisplay.variable} ${geologica.variable}`}
      >
        <Providers>
          <AuthProvider loggedIn={loggedIn}>
            <Toaster position="top-center" />
            <div className="flex min-h-screen flex-col">
              <Header />
              {children}
              <Footer />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
