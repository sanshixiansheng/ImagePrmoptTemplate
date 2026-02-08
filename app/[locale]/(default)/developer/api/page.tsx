"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Zap, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function APIDocsPage() {
  const t = useTranslations("developerApi");

  return (
    <div className="min-h-screen bg-card">
      <div className="container py-14 md:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              {t("testing_phase")}
            </div>
            <h1 className="mb-4 font-serif text-4xl font-medium text-foreground md:text-5xl">{t("title")}</h1>
            <p className="text-lg text-foreground/65">
              {t("subtitle")}
            </p>
          </div>

          {/* Overview */}
          <section className="mb-12">
            <Card className="rounded-3xl border-border/70 bg-background p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t("overview_title")}</h2>
              <p className="leading-relaxed text-foreground/70">
                {t("overview_desc")}
              </p>
            </Card>
          </section>

          {/* Available APIs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">{t("available_apis_title")}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image to Prompt API */}
              <Card className="rounded-3xl border-border/70 bg-background p-6 transition-shadow hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{t("image_to_prompt_title")}</h3>
                    <p className="text-muted-foreground mb-3">
                      {t("image_to_prompt_desc")}
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <Link href="/image-to-prompt" className="hover:underline">
                        {t("try_web_interface")}
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Magic Enhance API */}
              <Card className="rounded-3xl border-border/70 bg-background p-6 transition-shadow hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{t("magic_enhance_title")}</h3>
                    <p className="text-muted-foreground mb-3">
                      {t("magic_enhance_desc")}
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Link href="/text-to-prompt" className="hover:underline">
                        {t("try_web_interface")}
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* How to Join Testing */}
          <section className="mb-12">
            <Card className="rounded-3xl border-border/70 bg-background p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">{t("how_to_join_title")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("how_to_join_desc")}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">{t("join_requirement1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">{t("join_requirement2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">{t("join_requirement3")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">{t("join_requirement4")}</span>
                </li>
              </ul>
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <a href="mailto:pixmind.service@aimix.pro">
                  <Mail className="h-4 w-4 mr-2" />
                  {t("contact_button")}
                </a>
              </Button>
            </Card>
          </section>

          {/* Important Terms */}
          <section>
            <Card className="rounded-3xl border-border/70 bg-background p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-3 text-foreground">{t("pricing_title")}</h2>
                  <p className="text-muted-foreground mb-3">
                    <strong>{t("pricing_note")}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    {t("pricing_desc")}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Footer Note */}
          <div className="mt-12 text-center text-sm text-foreground/60">
            <p>{t("footer_note")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
