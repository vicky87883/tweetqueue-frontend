import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tweetqueue.com"),
  title: {
    default: "TweetQueue - Bulk Schedule Posts on X",
    template: "%s | TweetQueue",
  },
  description: "Schedule your entire week on X in minutes with a production-ready content queue.",
  applicationName: "TweetQueue",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TweetQueue - Bulk Schedule Posts on X",
    description: "Plan, schedule, and improve your X content from one creator dashboard.",
    url: "https://tweetqueue.com",
    siteName: "TweetQueue",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh overflow-x-hidden bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
