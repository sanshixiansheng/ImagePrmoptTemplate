import Pricing from "@/components/blocks/pricing";
import { getPricingPage } from "@/services/page";
import { generateSEOMetadata, generateProductSchema } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return generateSEOMetadata({
    title: t('seo.pricing.title'),
    description: t('seo.pricing.description'),
    keywords: t('seo.pricing.keywords'),
    locale,
    path: '/pricing',
    image: '/api/og?title=' + encodeURIComponent(t('seo.pricing.title')) + '&description=' + encodeURIComponent(t('seo.pricing.description')),
  });
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getPricingPage(locale);

  if (!page.pricing) {
    return null;
  }

  return (
    <div className="bg-card">
      <section className="border-b bg-background/60">
        <div className="container py-14 text-center md:py-16">
          <h1 className="font-serif text-4xl font-medium md:text-5xl">
            {page.pricing.title}
          </h1>
          {page.pricing.subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-foreground/65 md:text-lg">
              {page.pricing.subtitle}
            </p>
          )}
        </div>
      </section>
      <Pricing pricing={page.pricing} />
    </div>
  );
}
