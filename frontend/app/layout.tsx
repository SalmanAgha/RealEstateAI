import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hypofriend is Germany’s Clever Online Mortgage Broker",
  description: "Get a mortgage in Germany with Hypofriend, our technology & experts will find you the right mortgage free of charge. We’ll give you a free German mortgage recommendation in under 5-minutes or try our German mortgage calculator to see what you can afford.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  themeColor: "#FFF",
  openGraph: {
    title: "Hypofriend is Germany's Clever Online Mortgage Broker",
    images: ["https://a.hypofriend.de/hypofriend-house.png"],
    url: "https://hypofriend.de/en",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@HypoFriendDE",
    title: "Hypofriend is Germany's Clever Online Mortgage Broker",
    images: ["https://a.hypofriend.de/hypofriend-house.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
