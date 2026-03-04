"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  TechIconKey,
  PROJECT_CATEGORIES,
  PROJECT_INDUSTRIES,
  FullProjectData,
} from "@/types";
import { TechIconMap } from "@/services/utils/tech-icons";
import { createSlugFromTitle } from "@/services/utils/project-formatter";

interface BasicInfoEditorProps {
  draftData: FullProjectData;
  previewUrl: string | null | undefined;
  isSlugValid: boolean;
  handleFieldChange: <K extends keyof FullProjectData>(
    field: K,
    value: FullProjectData[K]
  ) => void;
  handleToggleTech: (tech: TechIconKey) => void;
  handleImageUpload: (file: File) => void;
  onNavigateToDetail: () => void;
}

export const BasicInfoEditor = ({
  draftData,
  previewUrl,
  isSlugValid,
  handleFieldChange,
  handleToggleTech,
  handleImageUpload,
  onNavigateToDetail,
}: BasicInfoEditorProps) => {
  const displayImage = previewUrl || draftData.imageSrc;
  const [isSynced, setIsSynced] = useState(!draftData.slug);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    handleFieldChange("title", newTitle);
    if (isSynced) {
      const newSlug = createSlugFromTitle(newTitle);
      if (newSlug !== draftData.slug) handleFieldChange("slug", newSlug);
    }
  };

  const handleManualSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSynced(false);
    handleFieldChange("slug", e.target.value);
  };

  return (
    <section className="space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 header-border pb-2">
        <h3 className="app-label">Basic Information</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToDetail}
            disabled={!isSlugValid}
            className={`px-3 py-1 text-sm-mono border transition-all duration-normal ${
              isSlugValid
                ? "border-content-primary text-content-primary hover:bg-content-primary hover:text-base-bg cursor-pointer"
                : "border-base-border text-layer-subtle cursor-not-allowed opacity-50"
            }`}
          >
            Edit Note
          </button>
          <div className="flex items-center gap-3 bg-layer-faint px-3 py-1 border border-base-border">
            <label
              htmlFor="show-detail-toggle"
              className="label-mono-small cursor-pointer"
            >
              Public
            </label>
            <input
              id="show-detail-toggle"
              type="checkbox"
              checked={draftData.showDetail || false}
              onChange={(e) =>
                handleFieldChange("showDetail", e.target.checked)
              }
              className="w-4 h-4 accent-content-primary cursor-pointer"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        <label className="app-label">Title</label>
        <input
          type="text"
          value={draftData.title || ""}
          onChange={handleTitleChange}
          className="app-input-full"
          placeholder="Project Title"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-widest text-layer-muted ml-1 flex items-center gap-2">
            URL Slug{" "}
            {isSynced && (
              <span className="text-tiny text-accent-1 font-mono animate-pulse">
                ● SYNCED
              </span>
            )}
          </label>
        </div>
        <input
          type="text"
          value={draftData.slug || ""}
          onChange={handleManualSlugChange}
          className="app-input-full bg-layer-faint font-mono text-sm border-dashed focus:border-solid"
          placeholder="Enter slug or auto-generate..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <span className="app-label block">Category</span>
          <div className="flex flex-wrap gap-2">
            {PROJECT_CATEGORIES.map((cat) => {
              const categories = Array.isArray(draftData.category)
                ? draftData.category
                : [];
              const isSelected = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    handleFieldChange(
                      "category",
                      isSelected
                        ? categories.filter((c) => c !== cat)
                        : [...categories, cat]
                    )
                  }
                  className={`px-3 py-1 text-sm-mono border transition-colors ${
                    isSelected
                      ? "bg-content-primary text-base-bg border-content-primary"
                      : "bg-layer-faint text-layer-medium border-base-border hover:border-layer-muted"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="app-label">Industry</label>
          <input
            list="industry-list"
            value={draftData.industry || ""}
            onChange={(e) => handleFieldChange("industry", e.target.value)}
            className="app-input-full"
          />
          <datalist id="industry-list">
            {PROJECT_INDUSTRIES.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="app-label">Summary</label>
        <textarea
          value={draftData.summary || ""}
          onChange={(e) => handleFieldChange("summary", e.target.value)}
          rows={3}
          className="app-input-full resize-none"
        />
      </div>

      {/* Links: Site (demo) URL and GitHub (code) URL — shown on ProjectCard */}
      <div className="space-y-4">
        <span className="app-label block">Links</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-layer-muted ml-1">
              Site URL (Demo)
            </label>
            <input
              type="url"
              value={draftData.demoUrl || ""}
              onChange={(e) => handleFieldChange("demoUrl", e.target.value)}
              className="app-input-full font-mono text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-layer-muted ml-1">
              GitHub URL (Code)
            </label>
            <input
              type="url"
              value={draftData.githubUrl || ""}
              onChange={(e) => handleFieldChange("githubUrl", e.target.value)}
              className="app-input-full font-mono text-sm"
              placeholder="https://github.com/..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 space-y-4">
          <span className="app-label block">Cover Image</span>
          <div
            className={`relative group border border-base-border bg-base-bg h-48 w-full flex items-center justify-center overflow-hidden transition-all ${
              isSlugValid
                ? "hover:border-accent-1 cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            {displayImage ? (
              <Image
                src={displayImage}
                alt="Preview"
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-slow"
              />
            ) : (
              <span className="text-xs-mono text-layer-subtle text-center px-4 leading-relaxed">
                {isSlugValid
                  ? "Click to Upload Image"
                  : "Enter Title to Upload Image"}
              </span>
            )}
            {isSlugValid && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleImageUpload(e.target.files[0])
                }
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Upload cover image"
              />
            )}
          </div>
        </div>
        <div className="md:col-span-7 space-y-4">
          <span className="app-label block">Tech Stack</span>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {(Object.keys(TechIconMap) as TechIconKey[]).map((techKey) => {
              const Icon = TechIconMap[techKey];
              const isSelected = draftData.techStack?.includes(techKey);
              return (
                <button
                  key={techKey}
                  type="button"
                  onClick={() => handleToggleTech(techKey)}
                  className={`p-3 border transition-all duration-normal ${
                    isSelected
                      ? "bg-content-primary text-base-bg border-content-primary"
                      : "bg-layer-faint text-layer-medium border-base-border hover:border-layer-muted"
                  }`}
                  title={techKey}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
