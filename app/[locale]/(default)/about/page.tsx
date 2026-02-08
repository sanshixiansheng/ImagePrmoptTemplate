"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Users, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function AboutPage() {
  const t = useTranslations('about');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="min-h-screen bg-card">
      <div className="container py-14 md:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-serif text-4xl font-medium text-foreground md:text-5xl">{t('title')}</h1>
            <p className="text-2xl font-semibold text-primary">
              {t('subtitle')}
            </p>
          </div>

          {/* Our Story */}
          <section className="mb-16">
            <Card className="rounded-3xl border-border/70 bg-background p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">{t('story_title')}</h2>
                  <p className="mb-4 leading-relaxed text-foreground/70">
                    {t('story_content')}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Our Mission */}
          <section className="mb-16">
            <Card className="rounded-3xl border-border/70 bg-background p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">{t('mission_title')}</h2>
                  <p className="text-lg leading-relaxed text-foreground/80">
                    {t('mission_content')}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Our Values */}
          <section className="mb-16">
            <Card className="rounded-3xl border-border/70 bg-background p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">{t('values_title')}</h2>
                  <p className="mb-6 leading-relaxed text-foreground/70">
                    {t('values_content')}
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border p-4 text-center">
                      <h3 className="mb-2 font-semibold text-foreground">{t('value_simplicity')}</h3>
                      <p className="text-sm text-muted-foreground">{t('value_simplicity_desc')}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4 text-center">
                      <h3 className="mb-2 font-semibold text-foreground">{t('value_creativity')}</h3>
                      <p className="text-sm text-muted-foreground">{t('value_creativity_desc')}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4 text-center">
                      <h3 className="mb-2 font-semibold text-foreground">{t('value_inclusivity')}</h3>
                      <p className="text-sm text-muted-foreground">{t('value_inclusivity_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Get in Touch */}
          <section>
            <Card className="rounded-3xl border-border/70 bg-background p-8 text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t('contact_title')}</h2>
              <p className="mb-6 text-foreground/70">
                {t('contact_content')}
              </p>
              <Button asChild size="lg">
                <Link href={`/${locale}/contact`}>
                  {t('contact_button')}
                </Link>
              </Button>
            </Card>
          </section>

          {/* Organization Info */}
          <div className="mt-12 text-center text-foreground/60">
            <p className="text-sm">{t('copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
