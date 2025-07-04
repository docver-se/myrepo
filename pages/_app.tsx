import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";

import { TeamProvider } from "@/context/team-context";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import PlausibleProvider from "next-plausible";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

import { EXCLUDED_PATHS } from "@/lib/constants";

import { PostHogCustomProvider } from "@/components/providers/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
  router,
}: AppProps<{ session: Session }>) {
  return (
    <>
      <Head>
        <title>Docverse | The Open Source Document Sharing Platform</title>
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Docverse is an open-source document sharing platform with built-in analytics and custom domains."
          key="description"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta
          property="og:title"
          content="Docverse | The Open Source Document Sharing Platform"
          key="og-title"
        />
        <meta
          property="og:description"
          content="Docverse is an open-source document sharing platform with built-in analytics and custom domains."
          key="og-description"
        />
        <meta
          property="og:image"
          content="https://app.docver.se/_static/meta-image.png"
          key="og-image"
        />
        <meta
          property="og:image:width"
          content="1200"
          key="og-image-width"
        />
        <meta
          property="og:image:height"
          content="630"
          key="og-image-height"
        />
        <meta
          property="og:url"
          content="https://app.docver.se"
          key="og-url"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" key="tw-card" />
        <meta name="twitter:site" content="@docversehq" />
        <meta name="twitter:creator" content="@docversehq" />
        <meta name="twitter:title" content="Docverse" key="tw-title" />
        <meta
          name="twitter:description"
          content="Docverse is an open-source document sharing platform with built-in analytics and custom domains."
          key="tw-description"
        />
        <meta
          name="twitter:image"
          content="https://app.docver.se/_static/meta-image.png"
          key="tw-image"
        />
        <link rel="icon" href="/favicon.ico" key="favicon" />
      </Head>
      <SessionProvider session={session}>
        <PostHogCustomProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <PlausibleProvider
              domain="docver.se"
              enabled={process.env.NEXT_PUBLIC_VERCEL_ENV === "production"}
            >
              <NuqsAdapter>
                <main className={inter.className}>
                  <Toaster closeButton />
                  <TooltipProvider delayDuration={100}>
                    {EXCLUDED_PATHS.includes(router.pathname) ? (
                      <Component {...pageProps} />
                    ) : (
                      <TeamProvider>
                        <Component {...pageProps} />
                      </TeamProvider>
                    )}
                  </TooltipProvider>
                </main>
              </NuqsAdapter>
            </PlausibleProvider>
          </ThemeProvider>
        </PostHogCustomProvider>
      </SessionProvider>
    </>
  );
}
