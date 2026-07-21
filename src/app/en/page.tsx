import type { Metadata } from "next";
import Link from "next/link";
import PlayStoreLink from "@/components/PlayStoreLink";
import { jsonLdSafe } from "@/lib/jsonld";

const title = "Pinle — See What People Actually Pay Nearby";
const description =
  "A community-updated map of real local prices. View, add, and verify prices for food and everyday services without mandatory sign-up.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/en",
    languages: { "tr-TR": "/android", en: "/en", "x-default": "/android" },
  },
  robots: { index: true, follow: true },
  openGraph: { title, description, type: "website", url: "/en", locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
};

const applicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Pinle",
  operatingSystem: "Android",
  applicationCategory: "LifestyleApplication",
  description: "A community-updated map of dated, real local price observations.",
  url: "https://pinle.app/en",
  downloadUrl: "https://play.google.com/store/apps/details?id=app.pinle.twa",
  datePublished: "2026-07-21",
  inLanguage: "en",
  offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
  publisher: { "@type": "Organization", name: "Revoba", url: "https://pinle.app" },
};

export default function EnglishLaunchPage() {
  return (
    <main lang="en" className="paper-grain min-h-dvh px-5 py-6 sm:px-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(applicationJsonLd) }}
      />
      <div className="relative z-[2] mx-auto flex max-w-4xl flex-col gap-10">
        <nav className="flex items-center justify-between gap-4" aria-label="Primary navigation">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-2xl" aria-hidden>📍</span>
            <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
          </Link>
          <Link href="/android" className="text-sm font-bold underline underline-offset-4">
            Türkçe
          </Link>
        </nav>

        <header className="flex flex-col items-start gap-5 py-5 sm:py-10">
          <p className="btn btn-mustard pointer-events-none px-4 py-1.5 text-sm">
            Now on Android
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] sm:text-6xl">
            See what people <span className="text-tomato">actually pay nearby.</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed opacity-80 sm:text-lg">
            Pinle is a community-updated map of dated price observations for food, drinks,
            shops, and everyday services. Check before you go, add what you paid, or confirm
            that a price is still current.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <PlayStoreLink
              source="en_hero"
              className="btn btn-tomato px-7 py-3 text-center"
              ariaLabel="Get Pinle on Google Play"
            >
              Get it on Google Play ↗
            </PlayStoreLink>
            <Link href="/" className="btn btn-cream px-7 py-3 text-center">
              Open the map 🗺️
            </Link>
          </div>
          <p className="text-xs leading-relaxed opacity-60">
            Free · No mandatory account for core use · Web and Android
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2" aria-labelledby="how-it-works">
          <div className="md:col-span-2">
            <p className="text-sm font-extrabold uppercase tracking-wide text-tomato">How it works</p>
            <h2 id="how-it-works" className="text-3xl font-extrabold">A price map that stays useful together</h2>
          </div>
          {[
            ["Discover", "Browse recent local price observations on a map before choosing where to go."],
            ["Contribute", "Add a place, item, and the price you actually saw or paid in a few steps."],
            ["Verify", "Confirm “still this price” or signal that the observation has changed."],
            ["Start simply", "Use the core map without creating a mandatory account or sharing your phone number."],
          ].map(([heading, copy], index) => (
            <article key={heading} className={`sticker-flat p-5 ${index === 1 ? "sticker-mustard" : ""}`}>
              <h3 className="text-xl font-extrabold">{heading}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-75">{copy}</p>
            </article>
          ))}
        </section>

        <section className="sticker-flat sticker-mint p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">Community observations, not official tariffs</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed opacity-75 sm:text-base">
            Prices on Pinle are dated observations shared by people. They can change and may
            not match an official menu. Check the date and verification signals, and update
            the map when reality changes.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="sticker-flat p-6">
            <h2 className="text-2xl font-extrabold">Starting locally</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-75">
              A price map becomes useful when a neighborhood has enough recent observations.
              Pinle is starting with focused district sprints in Türkiye and expanding where
              recurring contributors keep the map fresh.
            </p>
          </article>
          <article className="sticker-flat p-6">
            <h2 className="text-2xl font-extrabold">Add one real price</h2>
            <p className="mt-3 text-sm leading-relaxed opacity-75">
              The most helpful launch action is not only downloading the app. View a nearby
              price, then add or verify one observation from your neighborhood.
            </p>
          </article>
        </section>

        <section className="sticker sticker-tomato flex flex-col items-start gap-4 p-6 text-white sm:p-8">
          <h2 className="text-3xl font-extrabold">Make the next local price easier to find.</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            Download Pinle, open your neighborhood, and contribute one dated observation.
          </p>
          <PlayStoreLink
            source="en_bottom"
            className="btn btn-mustard px-7 py-3 text-ink"
            ariaLabel="Download Pinle for Android"
          >
            Download for Android ↗
          </PlayStoreLink>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/20 py-5 text-xs opacity-65">
          <p>Pinle · Revoba · 2026</p>
          <div className="flex gap-4">
            <Link href="/android">Türkçe</Link>
            <Link href="/gizlilik">Privacy</Link>
            <Link href="/fiyatlar">Price data</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
