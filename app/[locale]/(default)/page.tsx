import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TryNowButton } from "./try-now-button";
import { EffectsSection } from "./effects-section";
import { VideoCarousel } from "./video-carousel";
import { FAQSection } from "./faq-section";

export const metadata: Metadata = {
  title: "Image to Prompt Generator - AI image prompt generator",
  description:
    "Generate high-quality prompts from images and create AI visuals fast with Pixmind.",
};

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("homepage");

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,117,200,0.16),_transparent_45%)]" />
        <div className="container relative py-24 md:py-28 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
              {t("hero.title_main")}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base text-muted-foreground md:text-lg">
              {t("hero.subtitle")}
            </p>
            <p className="mx-auto mt-2 max-w-3xl text-base text-muted-foreground md:text-lg">
              {t("hero.description")}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <TryNowButton label={t("hero.try_now")} />
              <Link href="/blog">
                <Button size="lg" variant="outline" className="rounded-xl px-7">
                  {t("hero.tutorials")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <EffectsSection locale={locale} />

      <section className="container py-16 md:py-20">
        <div className="space-y-6 md:space-y-8">
          <article className="rounded-3xl border border-border/80 bg-card shadow-sm">
            <div className="grid gap-8 p-6 md:grid-cols-2 md:items-center md:p-10 lg:p-12">
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <Image
                  src="https://chatmix.top/pixmind/index_image_demo2.webp"
                  alt={t("showcase.card1.title")}
                  width={1200}
                  height={800}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <h2 className="font-serif text-2xl md:text-3xl">
                  {t("showcase.card1.title")}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t("showcase.card1.description")}
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      01
                    </span>
                    <div>
                      <p className="font-medium">{t("showcase.card1.feature1_title")}</p>
                      <p className="text-sm text-muted-foreground">{t("showcase.card1.feature1_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      02
                    </span>
                    <div>
                      <p className="font-medium">{t("showcase.card1.feature2_title")}</p>
                      <p className="text-sm text-muted-foreground">{t("showcase.card1.feature2_desc")}</p>
                    </div>
                  </div>
                </div>
                <Button className="mt-2 rounded-xl">{t("showcase.card1.start_creating")}</Button>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-border/80 bg-card shadow-sm">
            <div className="grid gap-8 p-6 md:grid-cols-2 md:items-center md:p-10 lg:p-12">
              <div className="space-y-5 md:order-1 order-2">
                <h2 className="font-serif text-2xl md:text-3xl">
                  {t("showcase.card2.title")}
                </h2>
                <p className="leading-7 text-muted-foreground">
                  {t("showcase.card2.description")}
                </p>
                <Link href="/video-generate/sora-2">
                  <Button className="rounded-xl">{t("showcase.card2.start_creating")}</Button>
                </Link>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border/70 md:order-2 order-1">
                <VideoCarousel />
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-border/80 bg-card shadow-sm">
            <div className="grid gap-8 p-6 md:grid-cols-2 md:items-center md:p-10 lg:p-12">
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <Image
                  src="https://chatmix.top/pixmind/index_image_demo3.png"
                  alt={t("showcase.card3.title")}
                  width={1200}
                  height={800}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="space-y-5">
                <h2 className="font-serif text-2xl md:text-3xl">
                  {t("showcase.card3.title")}
                </h2>
                <p className="leading-7 text-muted-foreground">
                  {t("showcase.card3.description")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/txt-to-image/all">
                    <Button className="rounded-xl">All Models</Button>
                  </Link>
                  <Link href="/txt-to-image/nano-banana">
                    <Button variant="outline" className="rounded-xl">
                      Nano Banana
                    </Button>
                  </Link>
                  <Link href="/txt-to-image/google-imagen">
                    <Button variant="outline" className="rounded-xl">
                      Google Imagen 4
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <FAQSection
        title={t("faq.title")}
        faqs={[
          { question: t("faq.q1_question"), answer: t("faq.q1_answer") },
          { question: t("faq.q2_question"), answer: t("faq.q2_answer") },
          { question: t("faq.q3_question"), answer: t("faq.q3_answer") },
          { question: t("faq.q4_question"), answer: t("faq.q4_answer") },
        ]}
      />
    </div>
  );
}


