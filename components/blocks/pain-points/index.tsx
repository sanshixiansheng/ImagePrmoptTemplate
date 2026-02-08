"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export interface PainPointProblem {
  icon: string;
  title: string;
  description: string;
  details: string[];
  stat: string;
  statLabel: string;
}

export interface PainPointsData {
  name: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  problems: PainPointProblem[];
  solution: {
    title: string;
    description: string;
    cta: string;
  };
  comparison?: {
    traditional_method: string;
    deep_video: string;
    traditional_cost: string;
    time_72h: string;
    time_5min: string;
    cost_5000: string;
    cost_5: string;
  };
}

interface PainPointsProps {
  section: PainPointsData;
}

export function PainPoints({ section }: PainPointsProps) {
  const problems = section.problems;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{section.subtitle}</span>
          </div>

          <h2 className="mb-6 text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
            {section.title}
          </h2>

          <p className="text-xl text-muted-foreground">{section.description}</p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {problems.map((problem, index) => (
            <Card
              key={index}
              className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div className="text-4xl">{problem.icon}</div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{problem.stat}</div>
                    <div className="text-sm text-muted-foreground">{problem.statLabel}</div>
                  </div>
                </div>

                <h3 className="mb-3 text-2xl font-semibold text-foreground">{problem.title}</h3>
                <p className="mb-6 text-muted-foreground">{problem.description}</p>

                <ul className="space-y-2">
                  {problem.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 text-primary">✓</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h3 className="mb-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            {section.solution.title}
          </h3>
          <p className="mb-8 text-xl text-muted-foreground">{section.solution.description}</p>
          <Link href="/">
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold"
            >
              {section.solution.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {section.comparison && (
          <div className="mt-20 grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-sm text-muted-foreground">{section.comparison.traditional_method}</div>
              <div className="text-2xl font-bold text-red-500 line-through">{section.comparison.time_72h}</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-sm text-muted-foreground">{section.comparison.deep_video}</div>
              <div className="text-2xl font-bold text-green-500">{section.comparison.time_5min}</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-sm text-muted-foreground">{section.comparison.traditional_cost}</div>
              <div className="text-2xl font-bold text-red-500 line-through">{section.comparison.cost_5000}</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-sm text-muted-foreground">{section.comparison.deep_video}</div>
              <div className="text-2xl font-bold text-green-500">{section.comparison.cost_5}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
