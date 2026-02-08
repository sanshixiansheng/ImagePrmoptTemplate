"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Twitter } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="min-h-screen bg-card">
      <div className="container py-14 md:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-serif text-4xl font-medium text-foreground md:text-5xl">{t('title')}</h1>
            <p className="text-lg text-foreground/65">{t('subtitle')}</p>
          </div>

          <Card className="mb-12 rounded-3xl border-border/70 bg-background p-8 shadow-sm">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-3 text-foreground">{t('testimonial_title')}</h3>
              <p className="mb-6 text-foreground/70">
                {t('testimonial_content')}
              </p>
              <Button asChild>
                <Link href="https://ijarxpcwej.feishu.cn/share/base/form/shrcn8zOCRLngGIjTBOCDcZOSlC" target="_blank">
                  {t('testimonial_button')}
                </Link>
              </Button>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-3xl border-border/70 bg-background p-8 transition-shadow hover:shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                  <Mail className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{t('email_title')}</h3>
                <p className="mb-4 text-foreground/70">
                  {t('email_content')}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a href={`mailto:${t('email_address')}`}>
                    {t('email_address')}
                  </a>
                </Button>
              </div>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-background p-8 transition-shadow hover:shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Twitter className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{t('social_title')}</h3>
                <p className="mb-4 text-foreground/70">
                  {t('social_content')}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="https://x.com/SplendorZhang" target="_blank">
                    {t('social_handle')}
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
