"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section as SectionType } from "@/types/blocks/section";
import Image from "next/image";

export default function Showcase1({ section }: { section: SectionType }) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!carouselApi) return;

    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    updateSelection();
    carouselApi.on("select", updateSelection);

    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-16 md:py-20">
      <div className="container">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl md:text-4xl">{section.title}</h2>
          <div className="hidden gap-2 md:flex">
            <Button
              size="icon"
              variant="outline"
              onClick={() => carouselApi?.scrollPrev()}
              disabled={!canScrollPrev}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => carouselApi?.scrollNext()}
              disabled={!canScrollNext}
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <Carousel setApi={setCarouselApi}>
        <CarouselContent className="container ml-0 mr-0">
          {section.items?.map((item, i) => (
            <CarouselItem key={i} className="basis-[88%] pl-4 md:basis-[50%] lg:basis-[33.333%]">
              <a
                href={item.url}
                target={item.target}
                className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                  <Image
                    src={item.image?.src || ""}
                    alt={item.image?.alt || item.title || "showcase"}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {item.label && (
                  <div className="mt-4">
                    <Badge variant="secondary">{item.label}</Badge>
                  </div>
                )}

                <h3 className="mt-3 line-clamp-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="container mt-4 flex gap-2 md:hidden">
        <Button
          size="icon"
          variant="outline"
          onClick={() => carouselApi?.scrollPrev()}
          disabled={!canScrollPrev}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => carouselApi?.scrollNext()}
          disabled={!canScrollNext}
        >
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}


