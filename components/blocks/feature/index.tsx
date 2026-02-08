import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";

export default function Feature({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-16 md:py-20">
      <div className="container">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl">{section.title}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{section.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {section.items?.map((item, i) => (
            <article
              key={i}
              className="group rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {item.icon && (
                <div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={item.icon} className="size-5" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
