"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import type { ProjectMedia } from "@/types";

interface ImageSliderProps {
  media: ProjectMedia[];
  title: string;
  priority?: boolean;
}

export const ImageSlider = ({
  media,
  title,
  priority = false,
}: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validMedia = useMemo(
    () =>
      media?.filter(
        (m) => m.url && m.url.length > 0 && m.url.toUpperCase() !== "TBD"
      ) ?? [],
    [media]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? validMedia.length - 1 : prev - 1));
  }, [validMedia.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= validMedia.length - 1 ? 0 : prev + 1));
  }, [validMedia.length]);

  if (validMedia.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center surface-container">
        <span className="label-mono-small uppercase">No Media Available</span>
      </div>
    );
  }

  const currentItem = validMedia[currentIndex] || validMedia[0];
  const isYouTube = currentItem.type === "youtube";
  const isMp4Video = currentItem.type === "video";

  return (
    <div className="relative w-full h-full group bg-base-bg overflow-hidden border border-base-border">
      <div className="relative w-full h-full flex items-center justify-center">
        {isMp4Video ? (
          <div className="w-full aspect-video bg-black">
            <video
              key={currentItem.url}
              src={currentItem.url}
              controls
              className="w-full h-full object-contain"
              playsInline
            />
          </div>
        ) : isYouTube ? (
          <div className="w-full aspect-video bg-black">
            <iframe
              key={currentItem.url}
              className="w-full h-full border-0"
              src={`https://www.youtube.com/embed/${currentItem.url}?rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <Image
            src={currentItem.url}
            alt={`${title} - ${currentIndex + 1}`}
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={priority}
          />
        )}
      </div>

      {validMedia.length > 1 && (
        <>
          <nav aria-label="Media navigation" className="pointer-events-none">
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full
                         surface-container border border-base-border
                         opacity-0 group-hover:opacity-100 transition-all duration-normal cursor-pointer pointer-events-auto
                         hover:bg-base-bg/80"
            >
              <span className="text-content-primary text-2xl font-light scale-y-150">
                &larr;
              </span>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full
                         surface-container border border-base-border
                         opacity-0 group-hover:opacity-100 transition-all duration-normal cursor-pointer pointer-events-auto
                         hover:bg-base-bg/80"
            >
              <span className="text-content-primary text-2xl font-light scale-y-150">
                &rarr;
              </span>
            </button>
          </nav>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col gap-3 items-center z-10 pointer-events-none">
            <span className="label-mono-small text-content-primary surface-container px-4 py-2 shadow-2xl backdrop-blur-sm">
              {(currentIndex + 1).toString().padStart(2, "0")}
              <span className="mx-2 text-layer-subtle">/</span>
              {validMedia.length.toString().padStart(2, "0")}
            </span>
            <div className="w-16 h-px bg-layer-muted relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-content-primary transition-all duration-normal"
                style={{
                  width: `${((currentIndex + 1) / validMedia.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
