"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { ProjectMedia } from "@/types";
import { isGifImageUrl } from "@/services/utils/image-url";

interface ImageSliderProps {
  media: ProjectMedia[];
  title: string;
  priority?: boolean;
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
    </svg>
  );
}

type MediaItem = ProjectMedia & { url: string };

function renderMedia(
  item: MediaItem,
  title: string,
  mode: "inline" | "lightbox",
  options: { priority?: boolean; onImageClick?: () => void }
) {
  const { priority, onImageClick } = options;
  const isYouTube = item.type === "youtube";
  const isMp4Video = item.type === "video";
  const isInline = mode === "inline";

  if (isMp4Video) {
    return (
      <div
        className={
          isInline
            ? "w-full aspect-video bg-black"
            : "flex max-h-[min(90vh,100%)] w-full max-w-full items-center justify-center"
        }
      >
        <video
          key={item.url + mode}
          src={item.url}
          autoPlay={isInline}
          muted
          loop={isInline}
          controls
          className={
            isInline
              ? "h-full w-full object-contain"
              : "max-h-[min(90vh,100%)] w-auto max-w-full object-contain"
          }
          playsInline
        />
      </div>
    );
  }

  if (isYouTube) {
    const src = `https://www.youtube.com/embed/${item.url}?rel=0`;
    return (
      <div
        className={
          isInline
            ? "aspect-video w-full bg-black"
            : "relative w-full max-w-[min(95vw,80rem)]"
        }
      >
        <div
          className={isInline ? "h-full w-full" : "relative aspect-video w-full"}
        >
          <iframe
            key={item.url + mode}
            className="absolute inset-0 h-full w-full border-0"
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (isInline) {
    const unoptimized = isGifImageUrl(item.url);
    return (
      <div
        className="relative h-full w-full cursor-zoom-in"
        onClick={onImageClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onImageClick?.();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open enlarged view"
      >
        <Image
          src={item.url}
          alt={`${title} — click to enlarge`}
          fill
          className="object-contain p-4"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={priority}
          unoptimized={unoptimized}
        />
      </div>
    );
  }

  // lightbox: native img avoided; use fill + bounded box for layout
  const unoptimizedLightbox = isGifImageUrl(item.url);
  return (
    <div className="relative h-[min(90vh,85dvh)] w-[min(95vw,1200px)] max-w-full">
      <Image
        src={item.url}
        alt={`${title}`}
        fill
        className="object-contain"
        sizes="95vw"
        unoptimized={unoptimizedLightbox}
      />
    </div>
  );
}

export const ImageSlider = ({
  media,
  title,
  priority = false,
}: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const validMedia = useMemo(
    () =>
      (media?.filter(
        (m) => m.url && m.url.length > 0 && m.url.toUpperCase() !== "TBD"
      ) ?? []) as MediaItem[],
    [media]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? validMedia.length - 1 : prev - 1));
  }, [validMedia.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= validMedia.length - 1 ? 0 : prev + 1));
  }, [validMedia.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft" && validMedia.length > 1) handlePrev();
      if (e.key === "ArrowRight" && validMedia.length > 1) handleNext();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, validMedia.length, handlePrev, handleNext]);

  const openLightbox = useCallback(() => setLightboxOpen(true), []);

  if (validMedia.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center surface-container">
        <span className="label-mono-small uppercase">No Media Available</span>
      </div>
    );
  }

  const currentItem = validMedia[currentIndex] || validMedia[0];
  const showExpandControl =
    currentItem.type === "video" || currentItem.type === "youtube";

  const lightbox =
    lightboxOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed inset-0 z-[200] flex flex-col bg-black/92 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Enlarged media"
      >
        <button
          type="button"
          onClick={() => setLightboxOpen(false)}
          className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center border border-base-border bg-base-bg/90 text-2xl text-content-primary transition-colors hover:bg-base-bg"
          aria-label="Close"
        >
          ×
        </button>

        {validMedia.length > 1 && (
          <nav
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2"
            aria-label="Previous enlarged item"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-base-border bg-base-bg/90 text-content-primary transition-colors hover:bg-base-bg"
            >
              <span className="scale-y-150 text-2xl font-light">&larr;</span>
            </button>
          </nav>
        )}
        {validMedia.length > 1 && (
          <nav
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2"
            aria-label="Next enlarged item"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-base-border bg-base-bg/90 text-content-primary transition-colors hover:bg-base-bg"
            >
              <span className="scale-y-150 text-2xl font-light">&rarr;</span>
            </button>
          </nav>
        )}

        <div
          className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-16 md:px-12"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="flex max-h-full max-w-full flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {renderMedia(currentItem, title, "lightbox", {})}
            {validMedia.length > 1 && (
              <span className="label-mono-small text-layer-medium">
                {(currentIndex + 1).toString().padStart(2, "0")}
                <span className="mx-2 text-layer-subtle">/</span>
                {validMedia.length.toString().padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="group relative h-full w-full overflow-hidden border border-base-border bg-base-bg">
      <div className="relative flex h-full w-full items-center justify-center">
        {renderMedia(currentItem, title, "inline", {
          priority,
          onImageClick: openLightbox,
        })}
      </div>

      {showExpandControl && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openLightbox();
          }}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center border border-base-border bg-base-bg/90 text-content-primary opacity-90 shadow-md transition-opacity hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          aria-label="Open enlarged view"
          title="Open enlarged view"
        >
          <ExpandIcon className="h-5 w-5" />
        </button>
      )}

      {validMedia.length > 1 && (
        <>
          <nav aria-label="Media navigation" className="pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              className="pointer-events-auto absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-base-border
                         surface-container opacity-0 transition-all duration-normal hover:bg-base-bg/80 group-hover:opacity-100"
            >
              <span className="scale-y-150 text-2xl font-light text-content-primary">
                &larr;
              </span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="pointer-events-auto absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-base-border
                         surface-container opacity-0 transition-all duration-normal hover:bg-base-bg/80 group-hover:opacity-100"
            >
              <span className="scale-y-150 text-2xl font-light text-content-primary">
                &rarr;
              </span>
            </button>
          </nav>

          <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
            <span className="label-mono-small surface-container px-4 py-2 text-content-primary shadow-2xl backdrop-blur-sm">
              {(currentIndex + 1).toString().padStart(2, "0")}
              <span className="mx-2 text-layer-subtle">/</span>
              {validMedia.length.toString().padStart(2, "0")}
            </span>
            <div className="relative h-px w-16 overflow-hidden bg-layer-muted">
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

      {lightbox}
    </div>
  );
};
