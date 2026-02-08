/* eslint-disable @next/next/no-img-element */
import { Section as SectionType } from "@/types/blocks/section";

export default function Branding({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-8 md:py-12">
      <div className="container">
        <div className="rounded-2xl border border-border/60 bg-card/50 px-6 py-8 shadow-sm">
          <h2 className="text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {section.title}
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 md:gap-10">
            {section.items?.map((item, idx) => {
              if (item.image) {
                return (
                  <img
                    key={idx}
                    src={item.image.src}
                    alt={item.image.alt || item.title}
                    className="h-7 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                  />
                );
              }
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
