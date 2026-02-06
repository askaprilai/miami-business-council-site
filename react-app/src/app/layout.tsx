import type { Metadata } from "next";
import "@/styles/globals.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miami Business Council | Premier Business Networking & Professional Development in Miami, FL",
  description: "Join Miami's premier business council. Network with industry leaders, access exclusive events, and accelerate your business growth in South Florida's dynamic market.",
  keywords: "Miami business council, Miami networking, business community, professional development, South Florida business",
  openGraph: {
    type: "website",
    url: "https://miamibusinesscouncil.com/",
    title: "Miami Business Council - Premier Business Community",
    description: "Join Miami's premier business community. Connect with industry leaders, access exclusive networking events, and grow your business.",
    images: [
      {
        url: "https://miamibusinesscouncil.com/Images/MDC FAVICON BLACK.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Miami Business Council - Premier Business Community",
    description: "Join Miami's premier business community. Connect with industry leaders, access exclusive networking events, and grow your business.",
  },
  robots: "index, follow",
  authors: [{ name: "Miami Business Council" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/Images/MDC FAVICON BLACK.png" />
        <link rel="canonical" href="https://miamibusinesscouncil.com/" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
