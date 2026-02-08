"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section as SectionType } from "@/types/blocks/section";

export default function FAQ({ section }: { section: SectionType }) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  if (section.disabled) {
    return null;
  }

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section id={section.name} className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />

      <div className="container relative z-10">
        <div className="text-center">
          {section.label && (
            <div className="mb-4 inline-flex items-center rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium text-muted-foreground">
              {section.label}
            </div>
          )}
          <h2 className="mb-6 text-3xl font-semibold tracking-tight lg:text-5xl">
            {section.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {section.description}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          {section.items?.map((item, index) => {
            const isOpen = openItems.includes(index);

            return (
              <div
                key={index}
                className="mb-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors duration-300 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <ChevronDown
                    className={`size-5 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="mb-4 h-px w-full bg-border/70" />
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
