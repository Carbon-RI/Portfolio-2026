"use client";

import React from "react";
import { ProjectSection, ProjectMedia } from "@/types";
import { Button } from "@/components/shared/Button";

interface ProjectDetailEditorProps {
  sections: ProjectSection[];
  isUploading: boolean;
  addSection: () => void;
  removeSection: (index: number) => void;
  updateSectionField: (
    sIndex: number,
    field: keyof ProjectSection,
    value: string | ProjectMedia[]
  ) => void;
  updateMedia: (
    sIndex: number,
    mIndex: number,
    field: keyof ProjectMedia,
    value: string
  ) => void;
  addMedia: (sIndex: number) => void;
  removeMedia: (sIndex: number, mIndex: number) => void;
  handleSectionImageUpload: (
    sIndex: number,
    mIndex: number,
    file: File
  ) => Promise<void>;
  handleSectionVideoUpload: (
    sIndex: number,
    mIndex: number,
    file: File
  ) => Promise<void>;
}

const MediaItem = ({
  media,
  isUploading,
  onUpdate,
  onRemove,
  onImageUpload,
  onVideoUpload,
}: {
  media: ProjectMedia;
  isUploading: boolean;
  onUpdate: (field: keyof ProjectMedia, value: string) => void;
  onRemove: () => void;
  onImageUpload: (file: File) => Promise<void>;
  onVideoUpload: (file: File) => Promise<void>;
}) => {
  const isImage = media.type === "image";
  const isVideo = media.type === "video";

  return (
    <div className="bg-base-bg border border-base-border p-4 transition-all duration-normal hover:border-layer-muted group">
      <div className="flex flex-wrap gap-4 items-center">
        {!media.url ? (
          <>
            <select
              value={media.type}
              onChange={(e) => onUpdate("type", e.target.value)}
              className="bg-base-bg border border-base-border p-2 text-xs-mono text-content-primary focus:ring-1 focus:ring-content-primary outline-hidden"
            >
              <option value="image">Image</option>
              <option value="video">Video (MP4)</option>
              <option value="youtube">YouTube</option>
            </select>

            {isImage ? (
              <label className="shrink-0">
                <span className="cursor-pointer px-4 py-2 border border-base-border text-xs-mono bg-base-bg text-layer-medium hover:text-content-primary hover:border-content-primary transition-all">
                  {isUploading ? "Uploading..." : "Select Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={(e) =>
                    e.target.files?.[0] && onImageUpload(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            ) : isVideo ? (
              <label className="shrink-0">
                <span className="cursor-pointer px-4 py-2 border border-base-border text-xs-mono bg-base-bg text-layer-medium hover:text-content-primary hover:border-content-primary transition-all">
                  {isUploading ? "Uploading..." : "Select MP4 Video"}
                </span>
                <input
                  type="file"
                  accept="video/mp4"
                  disabled={isUploading}
                  onChange={(e) =>
                    e.target.files?.[0] && onVideoUpload(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            ) : (
              <input
                type="text"
                placeholder="Enter YouTube ID or URL"
                value={media.url}
                onChange={(e) => onUpdate("url", e.target.value)}
                className="flex-1 min-w-37.5 bg-base-bg border border-base-border p-2 text-xs text-content-primary focus:border-content-primary outline-hidden"
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex gap-2 items-center overflow-hidden">
            <span className="text-xs-mono text-layer-medium shrink-0 uppercase">
              [{media.type}]
            </span>
            <span className="text-xs-mono text-layer-subtle truncate flex-1 font-mono italic">
              {isImage ? media.url.split("/").pop()?.split("?")[0] : media.url}
            </span>
          </div>
        )}

        <button
          onClick={onRemove}
          className="text-layer-muted hover:text-accent-2 transition-colors px-2 text-xl leading-none"
          title="Remove media"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const SectionItem = ({
  section,
  sIndex,
  isUploading,
  onRemove,
  onUpdateField,
  onUpdateMedia,
  onAddMedia,
  onRemoveMedia,
  onImageUpload,
  onVideoUpload,
}: {
  section: ProjectSection;
  sIndex: number;
  isUploading: boolean;
  onRemove: () => void;
  onUpdateField: (field: keyof ProjectSection, value: string) => void;
  onUpdateMedia: (
    mIndex: number,
    field: keyof ProjectMedia,
    value: string
  ) => void;
  onAddMedia: () => void;
  onRemoveMedia: (mIndex: number) => void;
  onImageUpload: (mIndex: number, file: File) => Promise<void>;
  onVideoUpload: (mIndex: number, file: File) => Promise<void>;
}) => {
  return (
    <div className="relative p-6 lg:p-10 surface-container border border-transparent focus-within:border-layer-muted transition-all">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs-mono text-layer-muted uppercase tracking-widest">
          Section {sIndex + 1}
        </span>
        <button
          onClick={onRemove}
          className="text-xs-mono text-layer-medium hover:text-accent-2 transition-all duration-normal"
        >
          [ Remove Section ]
        </button>
      </div>

      <div className="space-y-6">
        <input
          type="text"
          placeholder="Heading"
          value={section.heading}
          onChange={(e) => onUpdateField("heading", e.target.value)}
          className="app-input text-lg"
        />
        <textarea
          placeholder="Content (Markdown supported)"
          value={section.content}
          onChange={(e) => onUpdateField("content", e.target.value)}
          rows={6}
          className="app-input font-mono text-sm leading-relaxed resize-y"
        />

        <div className="space-y-4 pt-4 border-t border-base-border/50">
          <label className="app-label block">Section Media</label>
          {section.media?.map((media, mIndex) => (
            <MediaItem
              key={`${sIndex}-media-${mIndex}`}
              media={media}
              isUploading={isUploading}
              onUpdate={(field, value) => onUpdateMedia(mIndex, field, value)}
              onRemove={() => onRemoveMedia(mIndex)}
              onImageUpload={(file) => onImageUpload(mIndex, file)}
              onVideoUpload={(file) => onVideoUpload(mIndex, file)}
            />
          ))}

          <Button
            variant="dashed"
            onClick={onAddMedia}
            className="py-3"
          >
            + Add Media Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProjectDetailEditor = ({
  sections,
  isUploading,
  addSection,
  removeSection,
  updateSectionField,
  updateMedia,
  addMedia,
  removeMedia,
  handleSectionImageUpload,
  handleSectionVideoUpload,
}: ProjectDetailEditorProps) => {
  const handleRemoveSection = (index: number) => {
    if (
      window.confirm(
        "Are you sure you want to remove this section? This cannot be undone."
      )
    ) {
      removeSection(index);
    }
  };

  return (
    <div className="space-y-16">
      {sections.map((section, sIndex) => (
        <SectionItem
          key={`section-${sIndex}`}
          section={section}
          sIndex={sIndex}
          isUploading={isUploading}
          onRemove={() => handleRemoveSection(sIndex)}
          onUpdateField={(field, value) =>
            updateSectionField(sIndex, field, value)
          }
          onUpdateMedia={(mIndex, field, value) =>
            updateMedia(sIndex, mIndex, field, value)
          }
          onAddMedia={() => addMedia(sIndex)}
          onRemoveMedia={(mIndex) => removeMedia(sIndex, mIndex)}
          onImageUpload={(mIndex, file) =>
            handleSectionImageUpload(sIndex, mIndex, file)
          }
          onVideoUpload={(mIndex, file) =>
            handleSectionVideoUpload(sIndex, mIndex, file)
          }
        />
      ))}

      <Button variant="dashed" onClick={addSection} className="py-8 text-xxs tracking-wider">
        + Add New Content Section
      </Button>
    </div>
  );
};
