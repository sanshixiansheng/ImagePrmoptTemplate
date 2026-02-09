import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TryNowButton } from "./try-now-button";
import { EffectsSection } from "./effects-section";
import { VideoCarousel } from "./video-carousel";
import { FAQSection } from "./faq-section";
import { HomeWorkspace } from "./home-workspace";

export const metadata: Metadata = {
  title: "Image to Prompt Generator - AI image prompt generator",
  description:
    "Generate high-quality prompts from images and create AI visuals fast with Visora.",
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
      <section className="relative overflow-hidden border-b pt-24 pb-12 md:pt-28 lg:pt-36 lg:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(34,197,94,0.06),transparent_36%)]" />
        <div className="container relative">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <div className="mb-5 inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/70 transition-colors hover:bg-background">
                Visora Studio
              </div>
              <h1 className="mx-auto max-w-4xl text-balance font-serif text-4xl font-medium leading-tight md:text-5xl xl:text-6xl">
                {t("hero.title_main")}
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base text-foreground/70 md:text-lg">
                {t("hero.description")}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <TryNowButton label={t("hero.try_now")} />
                <Button asChild variant="outline" size="lg">
                  <Link href="/txt-to-image/nano-banana">Open Generator</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/blog">{t("hero.tutorials")}</Link>
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-foreground/65">
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50">Image to Prompt</span>
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50">Text to Image</span>
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50">Video Generate</span>
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50">No Setup</span>
              </div>
            </div>

            <div id="workspace" className="scroll-mt-28 mt-8 lg:mt-10">
              <HomeWorkspace />
              <div className="mt-4 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
                <div className="mb-2 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Showcase</p>
                  <p className="text-sm text-foreground/70">Bring still images to life</p>
                </div>
                <Image
                  src="https://chatmix.top/pixmind/index_image_demo2.webp"
                  alt="Bring still images to life"
                  width={1600}
                  height={900}
                  className="h-auto w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative overflow-hidden py-16 lg:py-24 xl:py-28"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(16,185,129,0.08),transparent_36%)]" />
        <div className="container">
          <div className="mx-auto max-w-3xl text-center relative">
            <small className="mb-4 inline-flex rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Product Capabilities
            </small>
            <h2 className="font-serif text-3xl font-medium leading-tight lg:text-4xl">
              {t("showcase.card1.title")}
            </h2>
            <p className="mt-3 text-foreground/65 lg:text-lg">{t("showcase.card1.description")}</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-12">
            <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-xs uppercase tracking-wide text-foreground/55">01</p>
              <h3 className="mt-2 text-lg font-semibold">Prompt Precision</h3>
              <p className="mt-2 text-sm text-foreground/65">
                Better prompt structure and model-aware formatting with less manual tuning.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-xs uppercase tracking-wide text-foreground/55">02</p>
              <h3 className="mt-2 text-lg font-semibold">Multi Model Workflow</h3>
              <p className="mt-2 text-sm text-foreground/65">
                Move from text-to-image to video and effects in one consistent interface.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <p className="text-xs uppercase tracking-wide text-foreground/55">03</p>
              <h3 className="mt-2 text-lg font-semibold">Fast Iteration</h3>
              <p className="mt-2 text-sm text-foreground/65">
                Iterate quickly with reusable prompts, aspect presets, and direct generation entry.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:mt-8">
            <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm transition-all duration-300 hover:shadow-md lg:p-8">
              <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Video Pipeline</p>
                  <h3 className="mt-2 font-serif text-2xl md:text-3xl">{t("showcase.card2.title")}</h3>
                  <p className="mt-4 text-foreground/70">{t("showcase.card2.description")}</p>
                  <div className="mt-5">
                    <Button asChild>
                      <Link href="/video-generate/sora-2">{t("showcase.card2.start_creating")}</Link>
                    </Button>
                  </div>
                </div>
                <div className="aspect-video min-h-[220px] overflow-hidden rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-all duration-300 hover:border-primary/40">
                  <VideoCarousel />
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm transition-all duration-300 hover:shadow-md lg:p-8">
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Image Pipeline</p>
                  <h3 className="mt-2 font-serif text-2xl md:text-3xl">{t("showcase.card3.title")}</h3>
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

      <section id="pricing" className="relative py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container">
          <div className="relative rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/40 p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Plans</p>
            <h2 className="mt-3 font-serif text-3xl font-medium lg:text-4xl">{t("showcase.card1.start_creating")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-foreground/65">
              Flexible plans for creators and teams. Keep your existing billing logic unchanged.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/pricing">View Pricing</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/affiliate">Earn with Affiliate</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-y bg-muted/25 py-14 lg:py-18">
        <div className="container">
          <div className="rounded-3xl border border-border/70 bg-background/90 p-2 shadow-sm transition-all duration-300 hover:shadow-md md:p-3">
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
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="rounded-3xl border border-border/70 bg-gradient-to-r from-card via-card to-muted/35 p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Community</p>
            <h3 className="mt-2 font-serif text-2xl font-medium lg:text-3xl">Stay in the loop</h3>
            <p className="mx-auto mt-2 max-w-xl text-foreground/65">
              Get updates on new models, prompts, and product improvements.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

