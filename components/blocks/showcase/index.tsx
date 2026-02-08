import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Section as SectionType } from "@/types/blocks/section";

export default function Showcase({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl">{section.title}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{section.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item, index) => (
            <Link key={index} href={item.url || ""} target={item.target}>
              <Card className="h-full overflow-hidden rounded-2xl border-border/70 p-0 transition-all hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={item.image?.src || ""}
                      alt={item.image?.alt || item.title || "showcase"}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-1 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
