import "./globals.css";

import Modals from "@/components/modals/modal";
import { getIsAuthenticated } from "@/features/auth/auth-queries";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import type { Metadata } from "next";
import { Geologica, Raleway } from "next/font/google";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Products App Commerce",
    template: "%s | Products App Commerce",
  },
  description:
    "A modern Next.js application leveraging Next 16's native Cache Component for optimized, granular data caching at the component level — enabling faster load times, reduced server load, and a seamless user experience through fine-grained control over what gets cached and when.",
};

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--raleway",
});

const geologica = Geologica({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--geologica",
});

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const loggedIn = getIsAuthenticated();

  return (
    <html lang="en">
      <body
        className={`${raleway.className} ${raleway.variable} ${geologica.variable}`}
      >
        <AuthProvider loggedIn={loggedIn}>
          <div className="flex min-h-screen flex-col">
            <Toaster position="top-center" />
            {children}
            <Modals />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
