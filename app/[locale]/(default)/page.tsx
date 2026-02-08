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
    <div className="bg-card text-foreground">
      <section className="relative overflow-hidden border-b pt-36 pb-14 lg:pt-44 lg:pb-16">
        <div className="container relative">
          <div className="mb-4 flex justify-start">
            <div className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
              New: {t("hero.subtitle")}
            </div>
          </div>

          <h1 className="text-balance font-serif text-3xl font-medium leading-tight md:text-4xl lg:text-5xl xl:text-6xl">
            {t("hero.title_main")}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-foreground/70 md:text-lg">
            {t("hero.description")}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <TryNowButton label={t("hero.try_now")} />
            <Button asChild variant="ghost" size="lg">
              <Link href="/blog">{t("hero.tutorials")}</Link>
            </Button>
          </div>

          <div className="mx-auto mt-12 rounded-4xl bg-primary/10 p-4 lg:mt-16 lg:p-6">
            <Image
              src="https://chatmix.top/pixmind/index_image_demo2.webp"
              alt={t("showcase.card1.title")}
              width={1600}
              height={900}
              className="h-auto w-full rounded-xl object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section id="features" className="py-12 lg:py-16 xl:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <small className="mb-4 block text-xs font-medium uppercase tracking-wider text-primary">
              Incredible features
            </small>
            <h2 className="font-serif text-2xl font-medium lg:text-3xl xl:text-4xl">
              {t("showcase.card1.title")}
            </h2>
            <p className="mt-2 text-foreground/60 lg:text-lg">{t("showcase.card1.description")}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:mt-12">
            <article className="rounded-4xl bg-background p-6 lg:p-8">
              <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
                <div>
                  <h3 className="font-serif text-xl md:text-2xl">{t("showcase.card2.title")}</h3>
                  <p className="mt-4 text-foreground/70">{t("showcase.card2.description")}</p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/video-generate/sora-2">{t("showcase.card2.start_creating")}</Link>
                    </Button>
                  </div>
                </div>
                <div className="rounded-2xl bg-card p-3">
                  <VideoCarousel />
                </div>
              </div>
            </article>

            <article className="rounded-4xl bg-background p-6 lg:p-8">
              <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
                <div>
                  <Image
                    src="https://chatmix.top/pixmind/index_image_demo3.png"
                    alt={t("showcase.card3.title")}
                    width={1200}
                    height={800}
                    className="h-auto w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl md:text-2xl">{t("showcase.card3.title")}</h3>
                  <p className="mt-4 text-foreground/70">{t("showcase.card3.description")}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href="/txt-to-image/all">All Models</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/txt-to-image/nano-banana">Nano Banana</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/txt-to-image/google-imagen">Google Imagen 4</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <EffectsSection locale={locale} />

      <section id="pricing" className="border-y bg-background/70 py-14">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-medium">{t("showcase.card1.start_creating")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-foreground/65">
            Flexible plans for creators and teams. Keep your existing billing logic unchanged.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="faq">
        <FAQSection
          title={t("faq.title")}
          faqs={[
            { question: t("faq.q1_question"), answer: t("faq.q1_answer") },
            { question: t("faq.q2_question"), answer: t("faq.q2_answer") },
            { question: t("faq.q3_question"), answer: t("faq.q3_answer") },
            { question: t("faq.q4_question"), answer: t("faq.q4_answer") },
          ]}
        />
      </section>

      <section className="py-14">
        <div className="container">
          <div className="rounded-3xl border bg-card p-8 text-center lg:p-10">
            <h3 className="font-serif text-2xl font-medium">Stay in the loop</h3>
            <p className="mx-auto mt-2 max-w-xl text-foreground/65">
              Get updates on new models, prompts, and product improvements.
            </p>
            <div className="mt-5">
              <Button asChild variant="secondary">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
