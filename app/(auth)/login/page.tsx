import { Metadata } from "next";

import LoginClient from "./page-client";

const data = {
  description: "Login to Docverse",
  title: "Login | Docverse",
  url: "/login",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://docver.se"),
  title: data.title,
  description: data.description,
  openGraph: {
    title: data.title,
    description: data.description,
    url: data.url,
    siteName: "Docverse",
    images: [
      {
        url: "/_static/meta-image.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: data.title,
    description: data.description,
    creator: "@papermarkio",
    images: ["/_static/meta-image.png"],
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
