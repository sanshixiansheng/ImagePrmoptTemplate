"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function BlogPage() {
  const t = useTranslations('blog');
  const params = useParams();
  const locale = params.locale as string;

  const articles = [
    {
      title: t('article_what_is_prompt_title'),
      description: t('article_what_is_prompt_desc'),
      slug: "what-is-an-image-prompt",
      date: "2025-01-15",
      category: t('category_tutorial'),
    },
  ];

  return (
    <div className="min-h-screen bg-card">
      <div className="container py-14 md:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-foreground/80">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Blog</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-serif text-4xl font-medium text-foreground md:text-5xl">{t('title')}</h1>
            </div>
            <p className="mt-4 text-lg text-foreground/65">{t('subtitle')}</p>
          </div>

          <div className="grid gap-6">
            {articles.map((article) => (
              <Card key={article.slug} className="rounded-3xl border-border/70 bg-background p-8 shadow-sm transition-shadow hover:shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {article.category}
                      </span>
                      <span className="text-sm text-foreground/60">
                        {new Date(article.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h2 className="mb-3 font-serif text-2xl font-medium text-foreground">{article.title}</h2>
                    <p className="mb-4 text-foreground/70">
                      {article.description}
                    </p>
                  </div>
                  <Button asChild className="gap-2">
                    <Link href={`/${locale}/blog/${article.slug}`}>
                      {t('read_more')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center text-foreground/60">
            <p>{t('more_coming')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
