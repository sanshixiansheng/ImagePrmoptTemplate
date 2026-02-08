import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";

export default function Stats({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />

      <div className="container relative z-10">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          {section.label && (
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium text-muted-foreground">
              {section.icon && <Icon name={section.icon} className="size-4" />}
              {section.label}
            </div>
          )}
          <h2 className="mt-4 text-3xl font-semibold tracking-tight lg:text-5xl">{section.title}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{section.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {section.items?.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {item.title}
              </p>
              <p className="text-5xl font-bold tracking-tight text-primary lg:text-6xl">{item.label}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
