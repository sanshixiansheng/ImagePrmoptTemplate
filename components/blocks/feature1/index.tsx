/* eslint-disable @next/next/no-img-element */
import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";

export default function Feature1({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-16 md:py-24">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {section.image && (
            <img
              src={section.image?.src}
              alt="placeholder hero"
              className="max-h-full w-full rounded-2xl border border-border/60 object-cover shadow-sm"
            />
          )}
          <div className="flex flex-col lg:text-left">
            {section.title && (
              <h2 className="mb-6 text-pretty text-3xl font-semibold tracking-tight lg:text-5xl">
                {section.title}
              </h2>
            )}
            {section.description && (
              <p className="mb-8 max-w-xl text-muted-foreground lg:max-w-none lg:text-lg">
                {section.description}
              </p>
            )}
            <ul className="flex flex-col justify-center gap-y-8">
              {section.items?.map((item, i) => (
                <li key={i} className="flex rounded-xl border border-border/50 bg-card/50 p-4">
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      className="mr-3 mt-0.5 size-5 shrink-0 text-primary lg:size-6"
                    />
                  )}
                  <div>
                    <div className="mb-2 text-sm font-semibold text-foreground md:text-base">
                      {item.title}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground md:text-base">
                      {item.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
